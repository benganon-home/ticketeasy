import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Clock, X, ChevronDown } from 'lucide-react';
import { events, categories, formatPrice, formatDate, formatTime, getHotnessLabel } from '../../data/mockData';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'hot');

  const filtered = events
    .filter((e) => {
      if (query && !e.title.includes(query) && !e.tags.some((t) => t.includes(query))) return false;
      if (selectedCat && e.category !== selectedCat) return false;
      if (e.originalPrice < priceRange[0] || e.originalPrice > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'hot') return b.hotness - a.hotness;
      if (sortBy === 'price') return a.originalPrice - b.originalPrice;
      if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
      return 0;
    });

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש אירוע, אמן, קבוצה..."
          className="input-field pr-10 pl-10"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-dark-300" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCat('')}
          className={`px-3 py-1.5 rounded-full text-xs font-600 whitespace-nowrap transition-all ${
            !selectedCat ? 'bg-primary-500 text-white' : 'bg-dark-50 dark:bg-dark-700 text-dark-500 dark:text-dark-300'
          }`}
        >
          הכל
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id === selectedCat ? '' : cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-600 whitespace-nowrap transition-all flex items-center gap-1 ${
              cat.id === selectedCat ? 'bg-primary-500 text-white' : 'bg-dark-50 dark:bg-dark-700 text-dark-500 dark:text-dark-300'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort & Filter bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-50 dark:bg-dark-700 text-sm font-500 transition-colors hover:bg-dark-100 dark:hover:bg-dark-600"
          >
            <SlidersHorizontal className="w-4 h-4" />
            סינון
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-dark-50 dark:bg-dark-700 text-sm font-500 border-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="hot">הכי חם</option>
            <option value="price">מחיר: נמוך → גבוה</option>
            <option value="date">תאריך: קרוב → רחוק</option>
          </select>
        </div>
        <span className="text-xs text-dark-300 dark:text-dark-400">{filtered.length} תוצאות</span>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card-flat mb-4 animate-slide-up">
          <h3 className="font-600 text-sm mb-3">טווח מחירים</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="input-field w-24 text-center text-sm"
              placeholder="מ-"
            />
            <span className="text-dark-300">—</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
              className="input-field w-24 text-center text-sm"
              placeholder="עד"
            />
            <span className="text-sm text-dark-400">₪</span>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((event) => {
          const hotness = getHotnessLabel(event.hotness);
          return (
            <Link key={event.id} to={`/event/${event.id}`} className="card p-0 overflow-hidden flex group">
              <div className="w-28 h-28 flex-shrink-0 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-600 text-sm line-clamp-1 flex-1">{event.title}</h3>
                    <span className={`badge badge-${hotness.color} text-[9px] mr-2`}>{hotness.text}</span>
                  </div>
                  <div className="flex items-center gap-1 text-dark-300 dark:text-dark-400 text-xs mb-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-dark-300 dark:text-dark-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{event.venue}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-700 text-primary-600 dark:text-primary-400 text-sm">
                    מ-{formatPrice(event.originalPrice)}
                  </span>
                  <span className="text-[10px] text-dark-300">{event.ticketsAvailable} זמינים</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">🎫</span>
          <p className="font-600 text-lg mb-1">לא נמצאו כרטיסים</p>
          <p className="text-sm text-dark-300 dark:text-dark-400">נסה לשנות את החיפוש או הסינון</p>
        </div>
      )}
    </div>
  );
}
