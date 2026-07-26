import { readFile } from 'node:fs/promises';

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:3333';
const seed = JSON.parse(await readFile(new URL('../seed/navigation-carousel.json', import.meta.url), 'utf8'));
const orders = JSON.parse(await readFile(new URL('../seed/orders.json', import.meta.url), 'utf8'));

const listResponse = await fetch(`${apiUrl}/navigation-carousels`);
if (!listResponse.ok) throw new Error(`API indisponível: HTTP ${listResponse.status}`);

const carousels = await listResponse.json();
const existing = carousels.find((carousel) => carousel.slug === seed.slug);
const endpoint = existing
  ? `${apiUrl}/navigation-carousels/${existing._id}`
  : `${apiUrl}/navigation-carousels`;

const response = await fetch(endpoint, {
  method: existing ? 'PATCH' : 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(seed),
});

if (!response.ok) throw new Error(`Falha ao aplicar seed: HTTP ${response.status} — ${await response.text()}`);
const saved = await response.json();
console.log(`${existing ? 'Atualizado' : 'Criado'}: ${saved.title} (${saved._id})`);

const ordersResponse = await fetch(`${apiUrl}/orders/import`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orders),
});
if (ordersResponse.status === 404) {
  throw new Error(
    'A API em execução ainda não possui POST /orders/import. Encerre o processo atual, reinicie com "npm run start:dev" e execute o seed novamente.',
  );
}
if (!ordersResponse.ok) throw new Error(`Falha ao importar pedidos: HTTP ${ordersResponse.status} — ${await ordersResponse.text()}`);
const savedOrders = await ordersResponse.json();
console.log(`Pedidos disponíveis: ${savedOrders.length}`);
