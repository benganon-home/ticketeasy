import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../App';
import { Bell, Shield, User } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const [notifCount] = useState(3);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src="/ticketeasy.svg"
            alt="TicketEasy"
            className="h-5 w-auto group-hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Trust badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-success-50 dark:bg-success-700/20 ml-2">
            <Shield className="w-3.5 h-3.5 text-success-500" />
            <span className="text-[10px] font-600 text-success-600 dark:text-success-300">מאובטח</span>
          </div>

          {/* Notifications */}
          <Link to="/messages" className="relative p-2 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
            <Bell className="w-5 h-5 text-dark-400 dark:text-dark-200" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger-400 text-white text-[10px] font-700 flex items-center justify-center animate-bounce-in">
                {notifCount}
              </span>
            )}
          </Link>

          {/* User / profile */}
          <Link
            to={user ? '/profile' : '/auth'}
            className="p-1.5 rounded-xl hover:bg-dark-50 transition-colors"
            aria-label={user ? 'הפרופיל שלי' : 'התחברות'}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-500" />
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
