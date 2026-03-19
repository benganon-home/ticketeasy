import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'בית' },
  { to: '/search', icon: Search, label: 'חיפוש' },
  { to: '/sell', icon: PlusCircle, label: 'מכירה', featured: true },
  { to: '/messages', icon: MessageCircle, label: 'הודעות' },
  { to: '/profile', icon: User, label: 'פרופיל' },
];

export default function BottomNav() {
  const location = useLocation();

  if (location.pathname === '/welcome') return null;

  return (
    <nav className="bottom-nav border-t border-dark-100 dark:border-dark-700">
      <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-around">
        {navItems.map(({ to, icon: Icon, label, featured }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                featured
                  ? 'relative -mt-5'
                  : active
                  ? 'text-primary-500'
                  : 'text-dark-300 dark:text-dark-400 hover:text-dark-500 dark:hover:text-dark-200'
              }`}
            >
              {featured ? (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              )}
              <span className={`text-[10px] font-500 ${featured ? 'text-primary-500 mt-0.5' : ''}`}>
                {label}
              </span>
              {active && !featured && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
