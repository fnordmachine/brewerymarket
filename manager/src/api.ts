import type { NavigationCarousel, Order } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export async function getOrders(signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/orders`, { signal });
  if (!response.ok) throw new Error('Não foi possível carregar os pedidos');
  return response.json() as Promise<Order[]>;
}

export async function getCarousels() {
  const response = await fetch(`${API_URL}/navigation-carousels`);
  if (!response.ok) throw new Error('Não foi possível carregar os carrosséis');
  return response.json() as Promise<NavigationCarousel[]>;
}

export async function saveCarousel(carousel: NavigationCarousel) {
  const { _id, ...payload } = carousel;
  const response = await fetch(`${API_URL}/navigation-carousels${_id ? `/${_id}` : ''}`, {
    method: _id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Não foi possível salvar o carrossel');
  return response.json() as Promise<NavigationCarousel>;
}

export async function uploadImage(file: File) {
  const data = new FormData();
  data.append('file', file);
  const response = await fetch(`${API_URL}/uploads/images`, { method: 'POST', body: data });
  if (!response.ok) throw new Error('Upload indisponível');
  return response.json() as Promise<{ url: string }>;
}
