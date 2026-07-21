import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Bell, Ticket, Tag, MessageCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import { getNotifications } from '../../services/notifications';
import { useAuth } from '../../App';

const ICONS = {
  purchase: Ticket,
  sale: Tag,
  message: MessageCircle,
  dispute: AlertTriangle,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.id)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <h1 className="font-800 text-xl mb-4">התראות</h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 card-flat">
          <Bell className="w-10 h-10 text-dark-200 mx-auto mb-3" />
          <p className="text-dark-400 text-sm">אין התראות חדשות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <Link key={n.id} to={n.to} className="card-flat flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-600 text-sm">{n.title}</p>
                  {n.subtitle && <p className="text-[11px] text-dark-400 truncate">{n.subtitle}</p>}
                </div>
                <ChevronLeft className="w-4 h-4 text-dark-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
