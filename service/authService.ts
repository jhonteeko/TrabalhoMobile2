import { API_URL } from '@/constants/api';

// ─── Tipos de resposta da API ─────────────────────────────────────────────────

export type ApiUser = {
  id: number;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: ApiUser;
};

// ─── Helper interno ───────────────────────────────────────────────────────────

async function post<T>(path: string, body: object, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    // Lança o erro retornado pela API (ex: "este nome de usuário já está em uso")
    throw new Error(data.error || 'Erro na requisição');
  }

  return data as T;
}

// ─── Endpoints públicos ───────────────────────────────────────────────────────

export function apiRegister(name: string, password: string) {
  return post<AuthResponse>('/auth/register', { name, password });
}

export function apiLogin(name: string, password: string) {
  return post<AuthResponse>('/auth/login', { name, password });
}
