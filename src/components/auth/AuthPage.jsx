import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { Shield, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
      }
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-800 text-2xl mb-1">
          {mode === 'login' ? 'ברוכים הבאים' : 'יצירת חשבון'}
        </h1>
        <p className="text-sm text-dark-300 dark:text-dark-400">
          {mode === 'login' ? 'התחברו לחשבון שלכם' : 'הצטרפו ל-TicketEasy'}
        </p>
      </div>

      {/* Google Sign-In */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors font-600 text-sm mb-4 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {mode === 'login' ? 'כניסה עם Google' : 'הרשמה עם Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-dark-100 dark:bg-dark-600" />
        <span className="text-xs text-dark-300">או</span>
        <div className="flex-1 h-px bg-dark-100 dark:bg-dark-600" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        {mode === 'register' && (
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="שם מלא"
              className="input-field text-sm pr-10 w-full"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת אימייל"
            className="input-field text-sm pr-10 w-full"
            dir="ltr"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            className="input-field text-sm pr-10 pl-10 w-full"
            dir="ltr"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-500"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20">
            <AlertCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
            <span className="text-xs text-danger-600 dark:text-danger-400">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}
        </button>
      </form>

      {/* Toggle mode */}
      <p className="text-center text-sm text-dark-400 mt-6">
        {mode === 'login' ? 'אין לך חשבון עדיין?' : 'כבר יש לך חשבון?'}{' '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); }}
          className="text-primary-500 font-600 hover:underline"
        >
          {mode === 'login' ? 'הרשמה' : 'כניסה'}
        </button>
      </p>
    </div>
  );
}

function getErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'לא נמצא חשבון עם האימייל הזה',
    'auth/wrong-password': 'סיסמה שגויה',
    'auth/email-already-in-use': 'האימייל הזה כבר רשום במערכת',
    'auth/weak-password': 'הסיסמה חייבת להכיל לפחות 6 תווים',
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/popup-closed-by-user': 'החלון נסגר לפני השלמת הכניסה',
    'auth/network-request-failed': 'בעיית רשת, נסה שוב',
    'auth/invalid-credential': 'אימייל או סיסמה שגויים',
    'auth/too-many-requests': 'יותר מדי ניסיונות, נסה שוב מאוחר יותר',
  };
  return messages[code] || 'אירעה שגיאה, נסה שוב';
}
