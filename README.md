# MarketBreja — Manager e vitrine

> Bases de conhecimento para Obsidian/RAG:
>
> - [`docs/marketbreja-carrossel-conhecimento.md`](docs/marketbreja-carrossel-conhecimento.md)
> - [`docs/marketbreja-relatorio-pedidos-conhecimento.md`](docs/marketbreja-relatorio-pedidos-conhecimento.md)

Implementação de referência do Manager e da vitrine em três aplicações independentes. Além do relatório de pedidos e do carrossel configurável, o projeto contém uma jornada completa de cross-sell de produtos:

- `manager`: React + Vite, editor usado pelo lojista;
- `ecommerce`: Next.js, vitrine pública e responsiva;
- `api`: NestJS + MongoDB, persistência, publicação e upload.

## Arquitetura

```text
manager (localhost:5173) ── CRUD/upload ──▶ api (localhost:3333) ──▶ MongoDB
                                                │
ecommerce (localhost:3000) ◀── endpoint público ┘
```

O relatório permite consultar e detalhar pedidos, aplicar filtros combinados e exportar todos os campos obrigatórios. O cross-sell inclui CRUD/importação de regras, gatilhos por produto/categoria/coleção, preview, descontos em itens sugeridos ou na combinação e proteção da comissão de sellers 3P. Consulte a [documentação do cross-sell](docs/cross-sell.md).

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
- `GET|POST /cross-sell-rules` — lista ou cria regras de cross-sell;
- `PATCH|DELETE /cross-sell-rules/:id` — edita ou exclui uma regra;
- `POST /cross-sell-rules/import` — importa regras de forma idempotente pelo código;
- `POST /public/cross-sell/preview` — resolve regras vigentes e calcula descontos.

## Produção

Para produção, substitua o armazenamento local de uploads por object storage/CDN, limite o CORS aos domínios conhecidos, proteja os endpoints administrativos com autenticação e mantenha apenas o endpoint `/public` exposto à vitrine.
