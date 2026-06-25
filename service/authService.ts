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

export type Ad= {
  id: number;
  title: string;
  description: string;
  price: number;
  tag: string;
  photo: string;
  seller: string;
}

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
}export async function apiGetAds(): Promise<Ad[]> {
  const response = await fetch(`${API_URL}/ads`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro ao carregar anúncios');
  return data;
}

export async function apiCreateAd(adData: {
  title: string;
  description: string;
  price: string;
  tag: string;
  photo: string;
  sellerId: number;
}): Promise<Ad> {
  const response = await fetch(`${API_URL}/ads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro ao criar anúncio');
  return data;
}




// ─── Endpoints públicos ───────────────────────────────────────────────────────

export function apiRegister(name: string, password: string) {
  return post<AuthResponse>('/auth/register', { name, password });
}

export function apiLogin(name: string, password: string) {
  return post<AuthResponse>('/auth/login', { name, password });
}
