import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

import { apiLogin, apiRegister, ApiUser } from '@/service/authService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type User = ApiUser & {
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  registerUser: (name: string, password: string) => Promise<void>;
  loginUser: (name: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const SESSION_KEY = 'session';

async function getStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return void localStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

async function removeStorage(key: string): Promise<void> {
  if (Platform.OS === 'web') return void localStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão salva ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const raw = await getStorage(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {

      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Salva sessão no storage e atualiza state
  async function saveSession(sessionUser: User) {
    await setStorage(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  // ── registerUser ──────────────────────────────────────────────────────────
  async function registerUser(name: string, password: string) {
    // A API agora retorna token + user no registro (veja auth.js atualizado)
    const { token, user: apiUser } = await apiRegister(name, password);
    await saveSession({ ...apiUser, token });
  }

  // ── loginUser ─────────────────────────────────────────────────────────────
  async function loginUser(name: string, password: string): Promise<boolean> {
    try {
      const { token, user: apiUser } = await apiLogin(name, password);
      await saveSession({ ...apiUser, token });
      return true;
    } catch {
      return false;
    }
  }

  // ── logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await removeStorage(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, registerUser, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}