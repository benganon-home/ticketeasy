import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getOrCreateUser } from './services/users';
import { seedEvents } from './services/seed';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import HomePage from './components/home/HomePage';
import SearchPage from './components/search/SearchPage';
import EventPage from './components/event/EventPage';
import SellPage from './components/sell/SellPage';
import BuyPage from './components/buy/BuyPage';
import SmartRevealPage from './components/buy/SmartRevealPage';
import AuthPage from './components/auth/AuthPage';
import ProfilePage from './components/profile/ProfilePage';
import MessagingPage from './components/messaging/MessagingPage';
import DisputesPage from './components/disputes/DisputesPage';
import FAQPage from './components/faq/FAQPage';
import LandingPage from './components/landing/LandingPage';
import TermsPage from './components/legal/TermsPage';
import EscrowPolicyPage from './components/legal/EscrowPolicyPage';
import DisclaimerPage from './components/legal/DisclaimerPage';
import PrivacyPage from './components/legal/PrivacyPage';
import AdminPage from './components/admin/AdminPage';

// Dark Mode Context
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// Auth Context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('te-dark-mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    seedEvents().catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getOrCreateUser(firebaseUser).catch(() => ({}));
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || profile.name || firebaseUser.email?.split('@')[0] || 'משתמש',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          verified: firebaseUser.emailVerified,
          rating: profile.rating,
          ratingCount: profile.ratingCount,
          salesCount: profile.salesCount,
          purchasesCount: profile.purchasesCount,
          isLoggedIn: true,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('te-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode((d) => !d);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      <AuthContext.Provider value={{ user, setUser, authLoading }}>
        <BrowserRouter>
          <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors duration-300">
            <Routes>
              <Route path="/welcome" element={<LandingPage />} />
              <Route
                path="*"
                element={
                  <>
                    <Header />
                    <main className="page-container">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/event/:id" element={<EventPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/escrow-policy" element={<EscrowPolicyPage />} />
                        <Route path="/disclaimer" element={<DisclaimerPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
                        <Route path="/buy/:offerId" element={<ProtectedRoute><BuyPage /></ProtectedRoute>} />
                        <Route path="/reveal/:txnId" element={<ProtectedRoute><SmartRevealPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
                        <Route path="/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                      </Routes>
                    </main>
                    <BottomNav />
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
