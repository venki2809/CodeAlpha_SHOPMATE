import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('shopmate_token')));

  useEffect(() => {
    let mounted = true;
    if (localStorage.getItem('shopmate_token')) {
      api.get('/auth/me').then(({ data }) => {
        if (mounted) setUser(data.user);
      }).catch(() => {
        localStorage.removeItem('shopmate_token');
        if (mounted) setUser(null);
      }).finally(() => { if (mounted) setChecking(false); });
    }
    const expired = () => { if (mounted) { setUser(null); setChecking(false); } };
    window.addEventListener('shopmate-session-expired', expired);
    return () => { mounted = false; window.removeEventListener('shopmate-session-expired', expired); };
  }, []);

  const acceptSession = useCallback(data => {
    localStorage.setItem('shopmate_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);
  const login = useCallback(async (email, password) => acceptSession((await api.post('/auth/login', { email, password })).data), [acceptSession]);
  const register = useCallback(async (name, email, password) => acceptSession((await api.post('/auth/register', { name, email, password })).data), [acceptSession]);
  const logout = useCallback(() => { localStorage.removeItem('shopmate_token'); setUser(null); }, []);
  const updateProfile = useCallback(async fields => {
    const { data } = await api.put('/auth/profile', fields);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(() => ({ user, checking, login, register, logout, updateProfile }),
    [user, checking, login, register, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
