# MarketBreja — Manager e vitrine

> Base de conhecimento para Obsidian/RAG: [`docs/marketbreja-carrossel-conhecimento.md`](docs/marketbreja-carrossel-conhecimento.md)

Implementação de referência do Manager e da vitrine em três aplicações independentes. O Manager contém o relatório de pedidos com filtros e exportação Excel:

- `manager`: React + Vite, editor usado pelo lojista;
- `ecommerce`: Next.js, vitrine pública e responsiva;
- `api`: NestJS + MongoDB, persistência, publicação e upload.

## Arquitetura

```text
manager (localhost:5173) ── CRUD/upload ──▶ api (localhost:3333) ──▶ MongoDB
                                                │
ecommerce (localhost:3000) ◀── endpoint público ┘
```

O relatório permite consultar e detalhar pedidos, aplicar filtros combinados e exportar todos os campos obrigatórios. Na planilha, cada produto ocupa uma linha. A API também preserva os endpoints do carrossel configurável usado pela vitrine.

## Executar localmente

Pré-requisitos: Node.js 20+ e Docker (ou uma instância MongoDB disponível).

```bash
docker compose up -d mongodb

cd api
cp .env.example .env
npm install
npm run start:dev
```

Com a API ativa, carregue os dados iniciais uma vez (o comando pode ser repetido com segurança):

```bash
cd api
npm run seed
```

Em outros terminais:

```bash
cd manager
cp .env.example .env
npm install
npm run dev
```

```bash
cd ecommerce
cp .env.example .env.local
npm install
npm run dev
```

Abra `http://localhost:5173` para acessar o relatório e `http://localhost:3000` para visualizar a loja. Na ausência da API, o Manager exibe pedidos demonstrativos e o ecommerce mantém os dados demonstrativos da vitrine.

O ecommerce consulta a API sem cache. O Manager identifica na tela quando está usando o fallback demonstrativo.

## Contratos principais

- `POST /navigation-carousels` — cria um componente;
- `GET /navigation-carousels` — lista componentes no manager;
- `PATCH /navigation-carousels/:id` — salva todas as configurações;
- `PATCH /navigation-carousels/:id/reorder` — persiste a ordem dos itens;
- `DELETE /navigation-carousels/:id` — remove o componente;
- `GET /public/navigation-carousels/:slug` — entrega somente componente e itens ativos;
- `POST /uploads/images` — recebe SVG, PNG, JPG, WEBP ou GIF de até 2 MB.
- `GET /health` — informa a conectividade da API e do MongoDB.
- `GET /orders` — lista todos os pedidos da loja;
- `POST /orders/import` — cria ou atualiza os pedidos da carga inicial.

## Produção

Para produção, substitua o armazenamento local de uploads por object storage/CDN, limite o CORS aos domínios conhecidos, proteja os endpoints administrativos com autenticação e mantenha apenas o endpoint `/public` exposto à vitrine.
