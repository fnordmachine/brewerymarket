---
title: "MarketBreja — Carrossel de Navegação"
aliases:
  - "Carrossel de Navegação MarketBreja"
  - "Componente de navegação do Portal do Cervejeiro"
  - "Navigation Carousel MarketBreja"
type: knowledge-base
status: implemented
created: 2026-07-26
updated: 2026-07-26
language: pt-BR
project: MarketBreja
domain: ecommerce
systems:
  - manager
  - ecommerce
  - api
technologies:
  - React
  - Vite
  - Next.js
  - NestJS
  - MongoDB
  - Mongoose
tags:
  - marketbreja
  - portal-do-cervejeiro
  - carrossel-de-navegacao
  - ecommerce
  - react
  - nextjs
  - nestjs
  - mongodb
  - rag
---

# MarketBreja — Carrossel de Navegação

## Resumo executivo

O projeto implementa um componente de Carrossel de Navegação configurável para o Portal do Cervejeiro da MarketBreja. O objetivo é permitir que lojistas criem atalhos visuais para categorias, subcategorias, coleções, marcas, departamentos, produtos, páginas, buscas e URLs externas sem necessidade de desenvolvimento adicional.

A solução foi separada em três repositórios independentes:

- `manager`: aplicação React com Vite para configuração administrativa do carrossel;
- `ecommerce`: aplicação Next.js que renderiza o carrossel na loja pública;
- `api`: aplicação NestJS com MongoDB para persistência, publicação e upload de imagens.

O manager envia as configurações para a API. A API persiste os dados no MongoDB e expõe uma representação pública contendo apenas componentes e itens ativos. O ecommerce consulta esse endpoint público sem cache e reflete as alterações na próxima recarga da página.

## Problema resolvido

Antes desta implementação, o Portal do Cervejeiro não possuía um componente nativo para navegação visual configurável. Cada nova experiência de navegação dependeria de uma implementação específica.

O Carrossel de Navegação resolve esse problema com um componente genérico e reutilizável que pode representar:

- estilos e categorias de cerveja;
- subcategorias;
- coleções e campanhas;
- marcas e produtores;
- departamentos;
- produtos específicos;
- páginas institucionais;
- páginas personalizadas;
- resultados de busca;
- links externos.

## Estado atual

Status da implementação: funcional e integrada ponta a ponta.

Foram validados:

- conexão da API com MongoDB;
- criação do carrossel por `POST`;
- carregamento administrativo por `GET`;
- atualização por `PATCH`, equivalente ao botão Salvar do manager;
- leitura do carrossel publicado pelo endpoint público;
- CORS entre manager e API;
- renderização no HTML do ecommerce com dados persistidos;
- compilação de produção dos três projetos;
- seed idempotente para criação ou atualização dos dados iniciais.

## Arquitetura

```text
┌──────────────────────────┐
│ Manager React + Vite     │
│ http://localhost:5173    │
└─────────────┬────────────┘
              │ CRUD, publicação e upload
              ▼
┌──────────────────────────┐       ┌──────────────────────┐
│ API NestJS               │──────▶│ MongoDB              │
│ http://localhost:3333    │       │ database: marketbreja│
└─────────────┬────────────┘       └──────────────────────┘
              │ endpoint público por slug
              ▼
┌──────────────────────────┐
│ Ecommerce Next.js        │
│ http://localhost:3000    │
└──────────────────────────┘
```

### Fluxo administrativo

1. O manager solicita `GET /navigation-carousels` ao iniciar.
2. Se houver um carrossel persistido, o primeiro registro é carregado no editor.
3. O lojista altera informações, itens, aparência ou responsividade.
4. A pré-visualização do manager é atualizada em tempo real no navegador.
5. Ao salvar, o manager executa `POST` para um novo registro ou `PATCH` para um registro existente.
6. A API normaliza a ordem dos itens e persiste o documento no MongoDB.
7. Se a API estiver indisponível, o manager mantém um rascunho no `localStorage`.

### Fluxo público

1. O ecommerce solicita `GET /public/navigation-carousels/:slug` durante a renderização da home.
2. A API procura um carrossel com o slug informado e `active: true`.
3. Itens inativos são removidos da resposta.
4. Os itens ativos são ordenados pelo campo `order`.
5. O Next.js renderiza o carrossel com as configurações visuais recebidas.
6. A consulta usa `cache: no-store`; uma publicação aparece após recarregar a loja.
7. Se a API estiver indisponível, o ecommerce usa dados demonstrativos locais.

## Estrutura dos repositórios

### Manager

Local: `manager/`

Arquivos principais:

- `manager/src/App.tsx`: editor, estado, drag-and-drop, formulário adaptativo e preview;
- `manager/src/api.ts`: cliente HTTP para listar, salvar e enviar imagens;
- `manager/src/types.ts`: contratos TypeScript do carrossel;
- `manager/src/data.ts`: dados iniciais, destinos e opções demonstrativas;
- `manager/src/styles.css`: identidade visual e responsividade do portal;
- `manager/.env`: URL local da API;
- `manager/.env.example`: modelo de configuração do ambiente.

Tecnologias principais:

- React 19;
- Vite;
- TypeScript;
- `@dnd-kit` para drag-and-drop;
- `lucide-react` para a biblioteca inicial de ícones.

### Ecommerce

Local: `ecommerce/`

Arquivos principais:

- `ecommerce/src/app/page.tsx`: home e consulta server-side ao endpoint público;
- `ecommerce/src/components/NavigationCarousel.tsx`: componente público do carrossel;
- `ecommerce/src/types.ts`: contrato TypeScript da resposta pública;
- `ecommerce/src/demo.ts`: fallback usado quando a API está indisponível;
- `ecommerce/src/app/globals.css`: estilos do storefront e do carrossel;
- `ecommerce/.env.local`: conexão local com a API;
- `ecommerce/.env.example`: modelo de configuração do ambiente.

Tecnologias principais:

- Next.js 15;
- React 19;
- TypeScript;
- App Router;
- renderização dinâmica da home por causa de `cache: no-store`;
- `lucide-react` para renderização dos ícones configurados.

### API

Local: `api/`

Arquivos principais:

- `api/src/main.ts`: bootstrap, CORS, validação global e arquivos estáticos;
- `api/src/app.module.ts`: configuração do MongoDB e módulos da aplicação;
- `api/src/health.controller.ts`: health check da API e do banco;
- `api/src/navigation-carousels/schemas/navigation-carousel.schema.ts`: schemas Mongoose;
- `api/src/navigation-carousels/dto/navigation-carousel.dto.ts`: validação dos payloads;
- `api/src/navigation-carousels/navigation-carousels.controller.ts`: rotas HTTP;
- `api/src/navigation-carousels/navigation-carousels.service.ts`: regras de persistência e publicação;
- `api/src/uploads/uploads.controller.ts`: upload e validação de imagens;
- `api/seed/navigation-carousel.json`: conteúdo inicial;
- `api/scripts/seed.mjs`: seed idempotente;
- `api/.env`: configuração local;
- `api/.env.example`: modelo de configuração do ambiente.

Tecnologias principais:

- NestJS 11;
- Mongoose 8;
- MongoDB;
- TypeScript;
- `class-validator` e `class-transformer`;
- Multer para upload de imagens.

## Modelo de domínio

### NavigationCarousel

O documento raiz representa um componente de carrossel.

| Campo | Tipo | Descrição |
|---|---|---|
| `_id` | ObjectId/string | Identificador gerado pelo MongoDB. |
| `internalName` | string | Nome administrativo, não exposto no endpoint público. |
| `slug` | string | Identificador único usado pelo ecommerce. |
| `title` | string | Título exibido na loja. |
| `showTitle` | boolean | Controla a exibição do título. |
| `active` | boolean | Controla a publicação do componente. |
| `sectionBackground` | string hexadecimal | Cor de fundo da seção. |
| `style` | object | Configurações visuais dos itens. |
| `responsive` | object | Comportamentos desktop e mobile. |
| `items` | NavigationItem[] | Itens de navegação ordenáveis. |
| `createdAt` | Date | Data de criação gerada pelo Mongoose. |
| `updatedAt` | Date | Data da última atualização gerada pelo Mongoose. |

### NavigationStyle

| Campo | Tipo/valores | Regra |
|---|---|---|
| `backgroundColor` | cor hexadecimal | Fundo de cada item. |
| `textColor` | cor hexadecimal | Cor do nome do item. |
| `borderColor` | cor hexadecimal | Cor da borda. |
| `borderWidth` | número entre 0 e 12 | Espessura em pixels. |
| `borderRadius` | número entre 0 e 100 | Arredondamento em pixels. |
| `shadow` | `none`, `soft`, `medium`, `strong` | Intensidade da sombra. |
| `hoverEffect` | `none`, `lift`, `glow`, `border` | Efeito do ponteiro. |
| `hoverScale` | número entre 1 e 1.2 | Escala aplicada no hover. |

### NavigationResponsive

| Campo | Tipo/valores | Regra |
|---|---|---|
| `desktopItems` | inteiro entre 1 e 12 | Quantidade visível no desktop. |
| `mobileItems` | inteiro entre 1 e 6 | Quantidade visível no mobile. |
| `gap` | inteiro entre 0 e 80 | Espaçamento em pixels. |
| `itemShape` | `circle`, `square`, `rectangle` | Formato dos itens. |
| `desktopArrows` | `always`, `never`, `hover` | Exibição das setas no desktop. |
| `mobileScroll` | boolean | Habilita rolagem horizontal mobile. |
| `mobileSnap` | boolean | Alinha itens após o gesto de rolagem. |

### NavigationItem

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador estável gerado no manager. |
| `name` | string | Texto exibido no item. |
| `image` | NavigationImage | Ícone ou imagem personalizada. |
| `destination` | NavigationDestination | Tipo e valor do destino. |
| `active` | boolean | Publicação individual do item. |
| `order` | inteiro | Posição do item no carrossel. |

### NavigationImage

| Campo | Tipo/valores | Descrição |
|---|---|---|
| `source` | `icon` ou `upload` | Origem da imagem. |
| `value` | string | Nome do ícone ou URL da imagem enviada. |
| `alt` | string opcional | Texto alternativo para acessibilidade. |

### NavigationDestination

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | DestinationType | Tipo do destino. |
| `value` | string | Identificador, termo ou URL. |
| `label` | string opcional | Nome legível do destino. |
| `openInNewTab` | boolean | Abre em nova aba, principalmente para URL externa. |

## Tipos de destino

| Valor persistido | Nome no manager | Caminho gerado no ecommerce |
|---|---|---|
| `category` | Categoria | `/categoria/{valor}` |
| `subcategory` | Subcategoria | `/categoria/{valor}` |
| `collection` | Coleção | `/colecao/{valor}` |
| `brand` | Marca | `/marca/{valor}` |
| `department` | Departamento | `/departamento/{valor}` |
| `product` | Produto | `/produto/{valor}` |
| `institutional` | Página institucional | `/institucional/{valor}` |
| `custom_page` | Página personalizada | `/paginas/{valor}` |
| `search` | Resultado de busca | `/busca?q={valor}` |
| `external_url` | URL externa | Usa a URL informada sem prefixo interno. |

O valor é codificado com `encodeURIComponent` para os destinos internos. URLs externas podem usar `target="_blank"` e `rel="noreferrer"` quando `openInNewTab` estiver ativo.

## Biblioteca e upload de imagens

### Biblioteca inicial

A biblioteca usa componentes SVG do pacote Lucide. Os nomes disponíveis na implementação inicial são:

- `Beer`;
- `Wheat`;
- `Coffee`;
- `Cherry`;
- `Leaf`;
- `Gift`;
- `Flame`;
- `Sparkles`;
- `ShoppingBag`;
- `Package`;
- `Zap`;
- `Store`.

O nome do ícone é persistido em `image.value`. Manager e ecommerce possuem um mapa equivalente de nome para componente Lucide.

### Upload

Endpoint: `POST /uploads/images`.

Regras implementadas:

- campo multipart: `file`;
- tamanho máximo: 2 MB;
- formatos MIME aceitos: SVG, PNG, JPEG/JPG, WEBP e GIF;
- nome físico gerado com UUID;
- armazenamento local em `api/uploads/`;
- exposição pública pelo prefixo `/uploads/`;
- resposta com `url`, `name` e `size`.

Se o upload falhar, o manager ainda mostra uma prévia local com `URL.createObjectURL` e informa que a API precisa estar disponível para concluir a persistência.

## Contratos HTTP

Base local da API: `http://localhost:3333`.

### Health check

```http
GET /health
```

Resposta esperada com banco conectado:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-07-26T04:02:57.549Z"
}
```

### Criar carrossel

```http
POST /navigation-carousels
Content-Type: application/json
```

Recebe o documento completo sem `_id`, `createdAt` ou `updatedAt`.

### Listar carrosséis administrativos

```http
GET /navigation-carousels
```

Retorna todos os documentos ordenados por atualização mais recente.

### Obter carrossel administrativo

```http
GET /navigation-carousels/:id
```

Retorna um documento pelo ObjectId do MongoDB.

### Atualizar carrossel

```http
PATCH /navigation-carousels/:id
Content-Type: application/json
```

O manager envia o documento configurável completo. Apesar do verbo `PATCH`, o DTO atual exige todos os campos do componente.

### Reordenar itens

```http
PATCH /navigation-carousels/:id/reorder
Content-Type: application/json

{
  "itemIds": ["ipa", "pilsen", "stout"]
}
```

A API converte a posição de cada ID em `order`. Itens não informados são posicionados depois dos IDs recebidos.

Observação: o manager atual persiste a ordem como parte do `PATCH` completo. O endpoint específico de reorder está pronto para fluxos futuros com salvamento incremental.

### Remover carrossel

```http
DELETE /navigation-carousels/:id
```

Retorna HTTP 204 quando a exclusão é concluída.

### Obter carrossel publicado

```http
GET /public/navigation-carousels/:slug
```

Regras da resposta pública:

- o carrossel precisa estar ativo;
- o campo administrativo `internalName` não é retornado;
- somente itens ativos são retornados;
- os itens são ordenados por `order`;
- retorna HTTP 404 quando não há componente publicado para o slug.

### Enviar imagem

```http
POST /uploads/images
Content-Type: multipart/form-data
```

Resposta de exemplo:

```json
{
  "url": "http://localhost:3333/uploads/uuid-da-imagem.webp",
  "name": "categoria-ipa.webp",
  "size": 58240
}
```

## Comportamento do manager

### Abas do editor

#### Geral

Permite editar:

- nome interno;
- slug;
- título da loja;
- exibição do título;
- status ativo/inativo do componente.

#### Itens

Permite:

- adicionar item;
- selecionar e editar item;
- excluir item;
- ativar ou inativar item;
- selecionar ícone;
- enviar imagem;
- escolher tipo de destino;
- preencher o destino por campo adaptativo;
- ordenar por drag-and-drop.

O formulário apresenta um seletor para destinos de catálogo e páginas, um campo textual para busca e um campo de URL para endereço externo.

#### Aparência

Permite editar:

- fundo da seção;
- fundo dos itens;
- cor do texto;
- cor da borda;
- formato circular, quadrado ou retangular;
- espessura da borda;
- arredondamento;
- sombra;
- efeito hover;
- escala no hover.

#### Responsivo

Permite editar:

- itens visíveis no desktop;
- exibição das setas no desktop;
- itens visíveis no mobile;
- rolagem horizontal mobile;
- snap mobile;
- espaçamento entre itens.

### Indicador de conectividade

O cabeçalho do editor mostra:

- `API CONECTADA`: os dados foram carregados ou salvos na API;
- `MODO LOCAL`: a API não respondeu e o manager está usando o fallback do navegador.

### Persistência local de contingência

Quando o salvamento remoto falha, o estado é serializado em `localStorage` com a chave:

```text
marketbreja-carousel
```

Na próxima inicialização, esse rascunho é carregado se a listagem da API falhar.

## Comportamento do ecommerce

O componente público recebe um objeto `NavigationCarousel` e converte suas configurações em CSS custom properties, incluindo cores, espaçamento, quantidade de itens, raio, espessura da borda e escala.

### Desktop

- largura dos itens calculada pela quantidade configurada;
- setas sempre visíveis, ocultas ou visíveis somente no hover;
- botões de seta usam `scrollBy` com rolagem suave;
- efeitos de hover aplicados conforme a configuração.

### Mobile

- quantidade independente de itens visíveis;
- rolagem horizontal;
- scrollbar visualmente escondida;
- snap opcional;
- setas desktop removidas.

### Fallback público

Se a API retornar erro, exceder o timeout de 1,8 segundo ou estiver indisponível, a home usa `ecommerce/src/demo.ts`. Esse fallback mantém a loja renderizável durante desenvolvimento ou indisponibilidade temporária, mas pode ocultar uma falha de integração se não houver monitoramento.

## Variáveis de ambiente

### API

```dotenv
PORT=3333
MONGODB_URI=mongodb://127.0.0.1:27017/marketbreja
PUBLIC_API_URL=http://localhost:3333
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Manager

```dotenv
VITE_API_URL=http://localhost:3333
```

### Ecommerce

```dotenv
API_URL=http://127.0.0.1:3333
NEXT_PUBLIC_API_URL=http://localhost:3333
NAVIGATION_CAROUSEL_SLUG=estilos-de-cerveja
```

`API_URL` é usada pelo servidor Next.js. `NAVIGATION_CAROUSEL_SLUG` define qual componente aparece na home.

## Execução local

Pré-requisitos:

- Node.js 20 ou superior;
- npm;
- MongoDB local ou Docker com Compose.

### Opção com Docker

```bash
docker compose up -d mongodb
```

### API

```bash
cd api
cp .env.example .env
npm install
npm run start:dev
```

### Dados iniciais

Com a API ativa:

```bash
cd api
npm run seed
```

O seed é idempotente. Ele procura um carrossel com o mesmo slug e executa `PATCH` se encontrar ou `POST` se ainda não existir.

### Manager

```bash
cd manager
cp .env.example .env
npm install
npm run dev
```

Acesso: `http://localhost:5173`.

### Ecommerce

```bash
cd ecommerce
cp .env.example .env.local
npm install
npm run dev
```

Acesso: `http://localhost:3000`.

## Build de produção

Cada repositório possui build independente:

```bash
cd api && npm run build
cd manager && npm run build
cd ecommerce && npm run build
```

Os três builds foram executados com sucesso após a integração.

## Rastreabilidade dos requisitos

| Requisito | Implementação | Estado |
|---|---|---|
| Nome interno | Campo `internalName` no manager e MongoDB | Implementado |
| Status do componente | Campo `active` | Implementado |
| Título e exibição | `title` e `showTitle` | Implementado |
| Cor de fundo, texto e borda | Configurações de seção e `style` | Implementado |
| Espaçamento | `responsive.gap` | Implementado |
| Itens desktop/mobile | `desktopItems` e `mobileItems` | Implementado |
| Circular, quadrado e retangular | `itemShape` | Implementado |
| Adicionar, editar e remover itens | Editor React | Implementado |
| Reordenar com drag-and-drop | `@dnd-kit` e campo `order` | Implementado |
| Nome, imagem, destino e status do item | Modelo `NavigationItem` | Implementado |
| Dez tipos de destino | `DestinationType` | Implementado |
| Formulário adaptativo por destino | Renderização condicional no manager | Implementado |
| Biblioteca SVG | Ícones Lucide | Implementado inicialmente |
| Upload SVG, PNG, JPG, WEBP e GIF | Endpoint Multer | Implementado |
| Limite de upload informado | Limite e texto de 2 MB | Implementado |
| Borda, raio, sombra, hover e escala | Modelo `NavigationStyle` | Implementado |
| Setas desktop | `desktopArrows` | Implementado |
| Rolagem e snap mobile | `mobileScroll` e `mobileSnap` | Implementado |
| Configurações independentes por dispositivo | Modelo responsivo e CSS | Implementado |
| Publicar somente itens ativos | Serviço do endpoint público | Implementado |
| Navegação ao clicar | Resolução de URL no ecommerce | Implementado no componente |

## Decisões técnicas

### Três repositórios independentes

Manager, ecommerce e API possuem seus próprios `package.json`, `package-lock.json`, `.gitignore`, documentação e repositório Git. Isso permite deploy, versionamento e pipelines separados.

### Documento agregado no MongoDB

Os itens foram modelados dentro do documento do carrossel. Essa escolha simplifica:

- leitura pública em uma única consulta;
- persistência da ordem;
- publicação atômica do componente;
- edição completa pelo manager.

### Slug como contrato entre API e ecommerce

O ecommerce não depende do ObjectId do MongoDB. Ele busca o componente por um slug configurável em ambiente. Isso reduz acoplamento e facilita substituir o documento administrativo sem alterar a vitrine.

### Resposta pública separada

O endpoint público não reutiliza diretamente a listagem administrativa. Ele remove o nome interno, filtra o status e ordena os itens. Essa separação reduz exposição de dados administrativos.

### CSS custom properties

As configurações visuais são transformadas em variáveis CSS no componente público. Isso mantém o componente genérico e evita gerar classes para cada combinação de personalização.

### Fallbacks de desenvolvimento

O manager usa `localStorage` e o ecommerce usa dados demonstrativos quando a API não responde. Esses mecanismos melhoram a experiência de desenvolvimento, mas devem ser acompanhados por observabilidade em produção.

## Limitações conhecidas

As seguintes capacidades não fazem parte da implementação atual ou precisam de evolução para produção:

- endpoints administrativos ainda não possuem autenticação nem autorização por lojista;
- não existe isolamento multi-tenant por `sellerId` ou `storeId`;
- o manager carrega automaticamente apenas o primeiro carrossel retornado; ainda não há tela de listagem e seleção de múltiplos componentes;
- as opções de categoria, produto, marca e páginas são dados demonstrativos locais, não consultas reais aos catálogos do seller;
- as páginas de destino do ecommerce não foram implementadas neste projeto; o componente apenas gera as URLs previstas;
- uploads usam disco local e devem migrar para S3, Cloud Storage ou serviço equivalente com CDN;
- SVG é aceito sem sanitização adicional; produção deve sanitizar ou processar arquivos antes da publicação;
- URLs externas contam com validação do campo HTML no manager, mas a API ainda não aplica validação rigorosa de protocolo;
- não há testes automatizados unitários, de integração ou end-to-end;
- não há paginação na listagem administrativa;
- não há trilha de auditoria, histórico de versões ou fluxo separado de rascunho e publicação;
- o endpoint público não possui cache HTTP ou CDN porque a implementação atual prioriza atualização imediata;
- não há observabilidade de fallback para diferenciar visualmente dados reais e dados demonstrativos no ecommerce.

## Recomendações para produção

Prioridade alta:

1. Adicionar autenticação ao manager e à API administrativa.
2. Incluir `sellerId` ou `storeId` no schema e em todas as consultas.
3. Integrar seletores de destino aos serviços reais de catálogo, CMS e busca.
4. Migrar uploads para object storage, aplicar sanitização e gerar URLs CDN.
5. Criar testes do serviço, contratos HTTP e navegação pública.

Prioridade média:

1. Criar listagem de componentes e seletor de página/posição no construtor de layout.
2. Separar rascunho de versão publicada.
3. Adicionar validação de URL externa na API.
4. Implementar cache com invalidação após publicação.
5. Adicionar analytics de impressão e clique por item.
6. Criar biblioteca de ícones do Seller versionada e pesquisável.

Prioridade futura:

1. Agendamento de publicação.
2. Segmentação por campanha, região ou perfil.
3. Experimentos A/B.
4. Traduções por locale.
5. Regras de acessibilidade e contraste automáticas.

## Troubleshooting

### Manager mostra “MODO LOCAL”

Verificar:

1. se a API está ativa em `http://localhost:3333`;
2. se `manager/.env` possui `VITE_API_URL=http://localhost:3333`;
3. se `GET /health` retorna `status: ok`;
4. se `CORS_ORIGINS` contém `http://localhost:5173`;
5. se o manager foi reiniciado após alterar `.env`.

### Health retorna banco desconectado ou API não inicia

Verificar:

1. se o MongoDB está ativo;
2. se `MONGODB_URI` está correto;
3. se a porta 27017 está disponível;
4. se o database `marketbreja` pode ser criado pelo usuário configurado.

### Ecommerce exibe dados demonstrativos

Verificar:

1. se `GET /public/navigation-carousels/estilos-de-cerveja` responde 200;
2. se o componente está ativo;
3. se o slug em `NAVIGATION_CAROUSEL_SLUG` corresponde ao documento;
4. se `API_URL` é acessível pelo processo do Next.js;
5. se a API responde em menos de 1,8 segundo.

### Upload falha

Verificar:

1. formato do arquivo;
2. limite máximo de 2 MB;
3. permissão de escrita em `api/uploads/`;
4. valor de `PUBLIC_API_URL`;
5. CORS e disponibilidade da API.

### Slug duplicado

O schema possui índice único para `slug`. Para atualizar o exemplo padrão, usar `npm run seed`, que procura o registro antes de decidir entre `POST` e `PATCH`.

## Critérios de aceite cobertos

### Adição e configuração do componente

O editor disponibiliza o Carrossel de Navegação com campos gerais, visuais e responsivos. A implementação atual representa a tela do componente; sua inserção em um catálogo maior de componentes do construtor de layout é uma integração futura.

### Cadastro de itens

Cada item possui nome, imagem ou ícone, destino e status. Novos itens podem ser adicionados, editados e removidos.

### Destinos adaptativos

O campo secundário muda de acordo com o tipo selecionado: seletor para entidades conhecidas, texto para busca e URL para endereço externo.

### Biblioteca e upload

O manager oferece biblioteca inicial de ícones SVG via Lucide e upload de cinco famílias de formato com limite explícito.

### Ordenação

O drag-and-drop atualiza o array e recalcula `order`. O salvamento completo persiste a nova ordem e o endpoint público a respeita.

### Personalização visual

Cores, bordas, formatos, arredondamento, sombra, hover, escala e espaçamento alimentam diretamente o preview e o componente público.

### Responsividade

Desktop e mobile possuem quantidades e comportamentos independentes. O mobile usa overflow horizontal e snap opcional.

### Navegação

O ecommerce resolve o tipo de destino para uma URL interna ou externa e usa `Link` do Next.js.

## Glossário

- **Manager**: aplicação administrativa usada pelo lojista.
- **Ecommerce**: storefront ou loja pública acessada pelo consumidor.
- **API pública**: endpoint somente de leitura usado pela loja.
- **Slug**: identificador textual estável do componente, por exemplo `estilos-de-cerveja`.
- **Item**: atalho visual individual do carrossel.
- **Destino**: conteúdo aberto ao clicar em um item.
- **Snap**: alinhamento automático do item depois de uma rolagem horizontal.
- **Seed**: rotina repetível que cria ou atualiza dados iniciais.
- **Fallback**: dado alternativo usado quando a API não está disponível.
- **Rascunho local**: configuração temporariamente salva no `localStorage` do navegador.

## Perguntas que este documento responde

- O que é o Carrossel de Navegação da MarketBreja?
- Quais aplicações foram criadas?
- Como manager, API, MongoDB e ecommerce se comunicam?
- Quais configurações visuais e responsivas existem?
- Quais tipos de destino são suportados?
- Como o drag-and-drop é persistido?
- Como o ecommerce filtra itens inativos?
- Como imagens e ícones são armazenados?
- Quais são os endpoints da API?
- Quais variáveis de ambiente são necessárias?
- Como executar e popular o projeto localmente?
- O que já foi validado?
- Quais limitações precisam ser resolvidas antes da produção?
- Como diagnosticar falhas de conexão, publicação ou upload?

## Referências internas do projeto

- Documento operacional: `README.md`;
- Configuração MongoDB local/Docker: `docker-compose.yml`;
- Manager: `manager/README.md`;
- Ecommerce: `ecommerce/README.md`;
- API: `api/README.md`;
- Payload inicial: `api/seed/navigation-carousel.json`.

