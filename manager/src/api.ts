import type { CatalogProduct, CrossSellRule, NavigationCarousel, Order } from './types';

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

export async function getCrossSellRules() {
  const response = await fetch(`${API_URL}/cross-sell-rules`);
  if (!response.ok) throw new Error('Não foi possível carregar as regras de cross-sell');
  return response.json() as Promise<CrossSellRule[]>;
}

export async function getCatalog() {
  const response = await fetch(`${API_URL}/public/products`);
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo');
  return response.json() as Promise<CatalogProduct[]>;
}

export async function saveCrossSellRule(rule: CrossSellRule) {
  const { _id, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = rule;
  const response = await fetch(`${API_URL}/cross-sell-rules${_id ? `/${_id}` : ''}`, {
    method: _id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<CrossSellRule>;
}

export async function deleteCrossSellRule(id: string) {
  const response = await fetch(`${API_URL}/cross-sell-rules/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Não foi possível excluir a regra');
}

export async function importCrossSellRules(rules: CrossSellRule[]) {
  const cleanRules = rules.map(({ _id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rule }) => rule);
  const response = await fetch(`${API_URL}/cross-sell-rules/import`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rules: cleanRules }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<{ received: number; created: number; updated: number }>;
}
