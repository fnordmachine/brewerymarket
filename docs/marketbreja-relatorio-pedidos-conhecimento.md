---
title: "MarketBreja — Relatório de Pedidos do Manager"
aliases:
  - "Relatório de Pedidos MarketBreja"
  - "Exportação Excel de Pedidos"
  - "Orders Report MarketBreja"
type: knowledge-base
status: implemented
created: 2026-07-26
updated: 2026-07-26
language: pt-BR
project: MarketBreja
domain: ecommerce-operations
systems:
  - manager
  - api
technologies:
  - React
  - Vite
  - TypeScript
  - NestJS
  - MongoDB
  - Mongoose
  - SpreadsheetML
tags:
  - marketbreja
  - portal-do-cervejeiro
  - pedidos
  - relatorio
  - excel
  - manager
  - nestjs
  - mongodb
  - rag
---

# MarketBreja — Relatório de Pedidos do Manager

## Resumo executivo

O Relatório de Pedidos é uma funcionalidade administrativa do Manager da MarketBreja. Ele permite consultar todos os pedidos da loja, combinar filtros operacionais, visualizar os dados completos de um pedido e exportar o resultado atual para um arquivo compatível com Microsoft Excel.

A regra central é a paridade entre a tela e a exportação:

- sem filtros, a tela e o arquivo consideram todos os pedidos carregados da loja;
- com filtros, os indicadores, a tabela e o arquivo consideram somente os pedidos filtrados;
- a paginação altera apenas as linhas visíveis na tela e nunca limita a exportação;
- cada produto do pedido ocupa uma linha da planilha;
- os dados gerais do pedido são repetidos em todas as suas linhas de produto.

A funcionalidade está distribuída entre:

- `manager`: interface, filtros, detalhamento, paginação e geração do arquivo Excel;
- `api`: leitura dos pedidos no MongoDB e importação idempotente dos dados iniciais.

O ecommerce público não participa do fluxo do relatório.

## Problema resolvido

O Manager não possuía uma visão consolidada que reunisse dados de pedido, cliente, pagamento, descontos, entrega, vendedor e produtos em um único relatório exportável.

A implementação resolve os seguintes cenários:

- conferência operacional dos pedidos;
- acompanhamento dos estados de pagamento e entrega;
- procura por pedido, cliente, documento ou e-mail;
- análise de pedidos por canal e forma de pagamento;
- seleção de pedidos por período;
- conciliação de gateways, antifraude e estornos;
- conferência de descontos, cupons, serviços e garantias;
- identificação de vendedor e vínculo com ERP;
- análise de produtos, quantidades e valores por item;
- geração de uma base tabular para uso no Excel ou LibreOffice.

## Estado atual

Status: implementado.

Foram entregues:

- rota do relatório no Manager;
- coexistência com o editor de Carrossel de Navegação;
- carregamento de pedidos por `GET /orders`;
- fallback local quando a API está indisponível;
- filtros combináveis e aplicados imediatamente;
- cards de resumo derivados do resultado filtrado;
- tabela paginada de pedidos;
- painel lateral com todos os detalhes do pedido;
- exportação Excel com os 42 campos obrigatórios;
- uma linha de planilha por produto;
- endpoint idempotente de importação de pedidos;
- seed integrado ao comando `npm run seed` da API;
- layout responsivo;
- build de produção validado no Manager e na API.

## Rotas do Manager

O Manager usa navegação por hash, sem dependência de um roteador externo.

| Funcionalidade | Rota |
|---|---|
| Relatório de pedidos | `#/pedidos` |
| Editor de carrossel | `#/personalizacao/carrossel` |

Em desenvolvimento local:

- relatório: `http://localhost:5173/#/pedidos`;
- carrossel: `http://localhost:5173/#/personalizacao/carrossel`.

O item **Pedidos** do menu abre o relatório. O item **Personalização** abre o editor do carrossel.

## Arquitetura

```text
┌──────────────────────────────────────────┐
│ Manager React + Vite                     │
│ #/pedidos                                │
│                                          │
│ - carrega todos os pedidos               │
│ - aplica filtros no cliente              │
│ - calcula indicadores                    │
│ - pagina somente a tabela                │
│ - gera o arquivo Excel                   │
└───────────────────┬──────────────────────┘
                    │ GET /orders
                    ▼
┌──────────────────────────────────────────┐
│ API NestJS                               │
│ OrdersController + OrdersService         │
└───────────────────┬──────────────────────┘
                    │ consulta ordenada
                    ▼
┌──────────────────────────────────────────┐
│ MongoDB                                  │
│ coleção: orders                          │
└──────────────────────────────────────────┘
```

### Fluxo de carregamento

1. O Manager inicia na rota de pedidos.
2. A função `getOrders` solicita `GET /orders`.
3. A API consulta a coleção de pedidos e ordena por `orderDate` decrescente.
4. A resposta é armazenada no estado `orders`.
5. Os filtros são aplicados em memória e geram `filteredOrders`.
6. Indicadores, tabela, paginação e exportação derivam desse resultado.
7. Se a requisição falhar, o Manager usa `sampleOrders` e exibe o indicador **DADOS DEMONSTRATIVOS**.

Uma resposta válida e vazia da API representa uma loja sem pedidos. O fallback só é usado quando a requisição falha.

### Fluxo da exportação

```text
orders
  │
  ├── sem filtros ─────────────────────┐
  │                                   │
  └── filtros ativos → filteredOrders ┤
                                      ▼
                            exportOrdersToExcel
                                      │
                                      ▼
                        uma linha para cada produto
                                      │
                                      ▼
                       relatorio-pedidos-AAAA-MM-DD.xls
```

1. O usuário seleciona **Exportar Excel**.
2. O Manager usa `filteredOrders`, não `visibleOrders`.
3. Cada pedido é expandido pela quantidade de registros em `items`.
4. Os 36 campos gerais são repetidos para cada produto.
5. Os 6 campos do produto completam a linha.
6. O navegador cria e baixa o arquivo `relatorio-pedidos-AAAA-MM-DD.xls`.
7. Uma notificação informa quantos pedidos e linhas de produto foram exportados.

## Estrutura do Manager

Arquivos principais:

- `manager/src/App.tsx`: relatório, filtros, indicadores, tabela, paginação, detalhes e roteamento por hash;
- `manager/src/CarouselManager.tsx`: editor do carrossel mantido no Manager;
- `manager/src/exportOrders.ts`: definição das 42 colunas e geração da planilha;
- `manager/src/api.ts`: clientes HTTP de pedidos, carrossel e upload;
- `manager/src/types.ts`: contratos TypeScript de pedidos e carrossel;
- `manager/src/data.ts`: filtros vazios, pedidos demonstrativos e dados iniciais do carrossel;
- `manager/src/styles.css`: identidade visual e responsividade das duas áreas.

### Estados relevantes

| Estado | Responsabilidade |
|---|---|
| `orders` | Todos os pedidos retornados pela API ou fallback. |
| `filters` | Valores atuais dos sete filtros. |
| `selectedOrder` | Pedido aberto no painel de detalhes. |
| `loading` | Controla as linhas de carregamento. |
| `demoMode` | Informa que o fallback local está em uso. |
| `page` | Página atualmente visível na tabela. |
| `toast` | Mensagem temporária após a exportação. |
| `route` | Hash que alterna pedidos e personalização. |

## Estrutura da API

Arquivos principais:

- `api/src/app.module.ts`: registra `OrdersModule`;
- `api/src/orders/orders.module.ts`: registra controller, service e model;
- `api/src/orders/orders.controller.ts`: expõe os endpoints HTTP;
- `api/src/orders/orders.service.ts`: consulta e importação idempotente;
- `api/src/orders/schemas/order.schema.ts`: schema Mongoose;
- `api/seed/orders.json`: pedidos iniciais persistidos pelo seed;
- `api/scripts/seed.mjs`: carga do carrossel e dos pedidos.

## Modelo de domínio

### Order

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador estável e único do pedido. |
| `orderStatus` | string | Estado comercial ou financeiro do pedido. |
| `deliveryStatus` | string | Estado logístico da entrega. |
| `orderNumber` | string | Número apresentado ao operador, como `#10482`. |
| `deliveryNumber` | string | Código da entrega. |
| `orderDate` | string/Date | Data e hora de criação do pedido. |
| `totalAmount` | number | Valor total do pedido. |
| `freightAmount` | number | Valor do frete. |
| `channel` | string | Canal de origem da venda. |
| `soldAndDeliveredBy` | string | Responsável pela venda e entrega. |
| `customer` | OrderCustomer | Informações do cliente. |
| `payment` | OrderPayment | Pagamento, gateway e antifraude. |
| `discounts` | OrderDiscounts | Descontos, cupom, serviço e garantia. |
| `delivery` | OrderDelivery | Endereços, cotação e envio. |
| `seller` | OrderSeller | Informações do vendedor. |
| `items` | OrderItem[] | Produtos do pedido. |

### OrderCustomer

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome ou razão social. |
| `document` | string | CPF ou CNPJ. |
| `email` | string | E-mail do cliente. |
| `phone` | string | Telefone do cliente. |

### OrderPayment

| Campo | Tipo | Descrição |
|---|---|---|
| `gateway` | string | Gateway responsável pelo pagamento. |
| `gatewayStatus` | string | Situação informada pelo gateway. |
| `antifraud` | string | Serviço antifraude. |
| `antifraudStatus` | string | Resultado da análise antifraude. |
| `method` | string | Forma e parcelamento do pagamento. |
| `paidAt` | string ou `null` | Data de aprovação. |
| `chargeId` | string | Identificador da cobrança. |
| `reference` | string | Referência interna ou externa. |
| `refundedAmount` | number | Valor estornado. |

### OrderDiscounts

| Campo | Tipo | Descrição |
|---|---|---|
| `applied` | string | Descrição dos descontos aplicados. |
| `coupon` | string | Cupom utilizado. |
| `service` | string | Serviço ou garantia aplicado. |
| `serviceValue` | number | Valor do serviço ou garantia. |

### OrderDelivery

| Campo | Tipo | Descrição |
|---|---|---|
| `address` | string | Endereço de entrega. |
| `billingAddress` | string | Endereço de cobrança. |
| `freightQuoteId` | string | Identificador da cotação de frete. |
| `shippingMethod` | string | Método de envio. |

### OrderSeller

| Campo | Tipo | Descrição |
|---|---|---|
| `erpCode` | string | Código do vendedor no ERP. |
| `name` | string | Nome do vendedor. |
| `email` | string | E-mail do vendedor. |
| `phone` | string | Telefone do vendedor. |
| `status` | string | Situação cadastral do vendedor. |

### OrderItem

| Campo | Tipo | Descrição |
|---|---|---|
| `sku` | string | Código do produto. |
| `title` | string | Título da variação ou item vendido. |
| `parentProduct` | string | Produto pai. |
| `unitPrice` | number | Preço unitário. |
| `quantity` | number | Quantidade comprada. |
| valor total calculado | number | `unitPrice * quantity`. |

## Filtros

Os filtros são combinados com lógica **E**. Um pedido precisa atender simultaneamente a todos os filtros preenchidos.

| Filtro | Campo ou regra |
|---|---|
| Busca | Número do pedido, número da entrega, nome, documento ou e-mail do cliente. |
| Status do pedido | Igualdade com `orderStatus`. |
| Status da entrega | Igualdade com `deliveryStatus`. |
| Canal | Igualdade com `channel`. |
| Forma de pagamento | Igualdade com `payment.method`. |
| Data inicial | `orderDate` maior ou igual à data informada. |
| Data final | `orderDate` menor ou igual à data informada. |

### Regras da busca textual

- espaços no início e no fim são removidos;
- a comparação não diferencia letras maiúsculas de minúsculas;
- o caractere `#` inicial é removido do termo pesquisado;
- a procura é parcial;
- documentos podem ser pesquisados com a formatação armazenada.

### Regras de período

- as datas inicial e final são inclusivas;
- o input final não permite data anterior à inicial;
- o input inicial não permite data posterior à final;
- a comparação utiliza a parte `AAAA-MM-DD` de `orderDate`.

### Limpeza

O botão **Limpar filtros** restaura `emptyFilters` e volta a considerar todos os pedidos. Sempre que qualquer filtro muda, a tabela retorna para a primeira página.

## Indicadores

Os três cards superiores sempre utilizam `filteredOrders`:

| Indicador | Cálculo |
|---|---|
| Pedidos encontrados | Quantidade de pedidos filtrados. |
| Valor dos pedidos | Soma de `totalAmount`. |
| Itens vendidos | Soma das quantidades de todos os produtos. |

Os indicadores não representam somente a página atual.

## Tabela e paginação

A tabela apresenta uma visão operacional resumida:

- número e data do pedido;
- cliente e e-mail;
- status do pedido;
- status e número da entrega;
- canal;
- quantidade total e quantidade de SKUs;
- valor total;
- ação para abrir os detalhes.

A paginação exibe cinco pedidos por página. O conjunto paginado é chamado `visibleOrders`. Ele não é usado na exportação.

## Painel de detalhes

Ao selecionar uma linha, o Manager abre um painel lateral com:

- informações do pedido;
- cliente;
- pagamento;
- descontos e benefícios;
- entrega;
- vendedor;
- tabela de produtos.

O painel pode ser fechado pelo botão superior ou clicando fora dele.

## Contrato da planilha

A planilha contém exatamente 42 colunas.

### Informações do pedido — 10 colunas

1. Status do pedido
2. Status da entrega
3. Número do pedido
4. Número da entrega
5. Data do pedido
6. Quantidade de itens
7. Valor total
8. Valor do frete
9. Canal
10. Vendido e entregue por

### Informações do cliente — 4 colunas

11. Nome do cliente
12. Documento (CPF/CNPJ)
13. E-mail do cliente
14. Telefone do cliente

### Informações do pagamento — 9 colunas

15. Gateway de pagamento
16. Status do gateway
17. Antifraude
18. Status do antifraude
19. Forma de pagamento
20. Data de aprovação (pago em)
21. ID da cobrança
22. Referência
23. Valor estornado

### Descontos e benefícios — 4 colunas

24. Descontos aplicados
25. Cupom utilizado
26. Serviço/garantia aplicado
27. Valor do serviço/garantia

### Informações de entrega — 4 colunas

28. Endereço de entrega
29. Endereço de cobrança
30. ID da cotação de frete
31. Método de envio

### Informações de vendedor — 5 colunas

32. Código ERP do vendedor
33. Nome do vendedor
34. E-mail do vendedor
35. Telefone do vendedor
36. Situação do vendedor

### Produto do pedido — 6 colunas

37. SKU
38. Título do produto
39. Produto pai
40. Preço unitário
41. Quantidade do produto
42. Valor total do produto

O valor total do produto é calculado durante a exportação por `unitPrice * quantity`.

## Formato Excel

O arquivo é produzido no navegador como SpreadsheetML compatível com Excel, utilizando:

- extensão `.xls`;
- MIME type `application/vnd.ms-excel`;
- cabeçalho verde com texto branco;
- formato monetário para colunas de valores;
- primeira linha congelada;
- filtro automático no cabeçalho;
- nome de arquivo com a data da exportação.

Não há dependência de uma biblioteca externa de planilhas.

## Contratos HTTP

### Listar pedidos

```http
GET /orders
```

Resposta de sucesso: `200 OK` com um array de pedidos ordenado do mais recente para o mais antigo.

### Importar pedidos

```http
POST /orders/import
Content-Type: application/json
```

O corpo é um array de pedidos. A API executa `bulkWrite` com `upsert` pelo campo `id`:

- um pedido inexistente é criado;
- um pedido existente é atualizado;
- executar o seed novamente não duplica registros.

Esse endpoint serve à carga inicial do ambiente de referência. Deve ser protegido ou removido de uma implantação pública.

## Seed

O comando abaixo carrega o carrossel e os pedidos:

```bash
cd api
npm run seed
```

Pré-condições:

- MongoDB ativo;
- API atualizada ativa em `http://127.0.0.1:3333`, ou no endereço definido em `API_URL`;
- endpoint `POST /orders/import` disponível.

O seed contém três pedidos persistidos e cinco linhas de produto. O fallback do Manager contém uma amostra maior para demonstração sem API.

## Execução local

### MongoDB

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

Em outro terminal, depois que a API estiver pronta:

```bash
cd api
npm run seed
```

### Manager

```bash
cd manager
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173/#/pedidos`.

## Variáveis de ambiente

### Manager

| Variável | Padrão | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3333` | URL da API usada pelo navegador. |

### API

| Variável | Padrão | Uso |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/marketbreja` | Conexão MongoDB. |
| `PORT` | `3333` | Porta HTTP. |
| `CORS_ORIGINS` | todas as origens | Lista de origens administrativas permitidas. |

### Script de seed

| Variável | Padrão | Uso |
|---|---|---|
| `API_URL` | `http://127.0.0.1:3333` | API chamada pelo script. |

## Build de produção

Manager:

```bash
cd manager
npm run build
```

API:

```bash
cd api
npm run build
```

Os dois builds foram executados com sucesso após a implementação.

## Rastreabilidade dos requisitos

| Requisito | Implementação |
|---|---|
| Exportar relatório em Excel | `exportOrdersToExcel` gera e baixa o arquivo `.xls`. |
| Usar somente dados filtrados | A exportação recebe `filteredOrders`. |
| Sem filtros, retornar todos | Filtros vazios aprovam todos os elementos de `orders`. |
| Incluir informações do pedido | Dez colunas no contrato da planilha. |
| Incluir cliente | Quatro colunas no contrato. |
| Incluir pagamento | Nove colunas no contrato. |
| Incluir descontos e benefícios | Quatro colunas no contrato. |
| Incluir entrega | Quatro colunas no contrato. |
| Incluir vendedor | Cinco colunas no contrato. |
| Incluir todos os produtos | `flatMap` gera uma linha para cada item. |
| Calcular total do produto | `unitPrice * quantity`. |
| Não limitar pela paginação | Exportação usa o conjunto filtrado completo. |

## Decisões técnicas

### Filtros no cliente

A API retorna todos os pedidos e o Manager aplica os filtros localmente. Isso mantém indicadores, tabela e exportação sincronizados com uma única fonte de estado e é adequado ao volume demonstrativo.

### Uma linha por produto

Uma célula não representa adequadamente múltiplos produtos. Repetir as informações do pedido em cada linha facilita filtros, tabelas dinâmicas, somas por SKU e integração com outras ferramentas.

### Exportação sem dependência externa

SpreadsheetML foi usado para evitar adicionar uma biblioteca de planilha ao bundle. A estrutura possui tipos numéricos, estilo monetário e recursos reconhecidos pelo Excel.

### Fallback somente para falhas

Uma loja sem pedidos precisa apresentar estado vazio. Por isso, o fallback é acionado por falha de rede ou HTTP, não por um array vazio.

### Seed idempotente

O `upsert` por `id` permite repetir a preparação do ambiente sem criar duplicatas.

## Limitações conhecidas

- os filtros são executados no navegador e pressupõem que todos os pedidos caibam em uma única resposta;
- a planilha é SpreadsheetML `.xls`, não um arquivo Office Open XML `.xlsx`;
- o endpoint de importação não possui autenticação no ambiente de referência;
- os objetos aninhados do schema Mongoose usam estrutura genérica e podem receber validação de domínio mais rigorosa;
- o relatório não possui ordenação manual por coluna;
- a paginação é local e possui tamanho fixo de cinco pedidos;
- a exportação é síncrona no navegador;
- valores exibidos e exportados usam a moeda BRL;
- o fallback local e o seed persistido têm quantidades diferentes de pedidos demonstrativos.

## Recomendações para produção

- autenticar todas as rotas administrativas;
- restringir ou remover `POST /orders/import` após a preparação do ambiente;
- associar os pedidos à loja autenticada e impedir leitura entre lojas;
- aplicar paginação, filtros e ordenação na API para volumes grandes;
- criar um endpoint assíncrono de exportação para relatórios extensos;
- gerar `.xlsx` ou armazenar relatórios em object storage quando necessário;
- validar CPF/CNPJ, e-mail, telefone, valores monetários e transições de status;
- criar índices compostos de acordo com os filtros mais frequentes;
- registrar auditoria de exportações com usuário, loja, filtros e horário;
- limitar intervalo máximo de datas;
- mascarar dados pessoais conforme as permissões e políticas de LGPD;
- substituir `Record<string, unknown>` por subdocumentos Mongoose tipados;
- cobrir filtragem e geração de planilha com testes automatizados.

## Troubleshooting

### Seed retorna `Cannot POST /orders/import`

A API em execução é uma instância anterior à criação do módulo de pedidos.

```bash
# encerre a API com Ctrl+C e reinicie
cd api
npm run start:dev
```

Em outro terminal:

```bash
cd api
npm run seed
```

Confirme a rota antes do seed:

```bash
curl http://localhost:3333/orders
```

A resposta deve ser um array, ainda que vazio, e não `404`.

### Manager mostra `DADOS DEMONSTRATIVOS`

O navegador não conseguiu concluir `GET /orders`. Verifique:

- se a API está ativa;
- se `VITE_API_URL` aponta para a porta correta;
- se o MongoDB está conectado;
- se o CORS permite a origem do Manager;
- se `GET /orders` responde sem erro.

### Relatório aparece vazio

- limpe os filtros;
- confirme se `GET /orders` retorna registros;
- execute `npm run seed`;
- confirme se o período selecionado inclui as datas dos pedidos.

### Exportação não inicia

- confirme que existe pelo menos um pedido no resultado;
- verifique se o navegador permite downloads iniciados pela página;
- limpe filtros que estejam produzindo resultado vazio.

### Carrossel não aparece no Manager

O relatório e o carrossel são rotas distintas. Acesse `#/personalizacao/carrossel` ou use o item **Personalização** do menu lateral.

## Critérios de aceite cobertos

### Com filtros

- ao preencher qualquer filtro, a quantidade de pedidos é recalculada;
- cards e tabela usam o mesmo resultado;
- a exportação contém somente os pedidos que atendem aos filtros;
- todos os produtos dos pedidos filtrados são incluídos.

### Sem filtros

- todos os pedidos carregados são contabilizados;
- a tabela apresenta o conjunto completo por páginas;
- a exportação ignora a paginação e contém todos os pedidos;
- cada item de cada pedido gera uma linha.

### Campos obrigatórios

- os 42 campos estão declarados em `exportOrders.ts`;
- valores monetários são exportados como números;
- datas são formatadas em `pt-BR`;
- ausência de data de aprovação é representada por travessão;
- o valor total do produto é calculado na geração da linha.

## Glossário

| Termo | Significado |
|---|---|
| Manager | Aplicação administrativa usada pelo lojista. |
| Pedido | Venda consolidada, com cliente, pagamento, entrega e produtos. |
| SKU | Identificador de uma variação comercial de produto. |
| Produto pai | Cadastro principal relacionado à variação vendida. |
| Gateway | Provedor responsável pelo processamento do pagamento. |
| Antifraude | Serviço que avalia o risco da transação. |
| Cotação de frete | Proposta logística utilizada para calcular o envio. |
| Resultado filtrado | Todos os pedidos que atendem aos filtros atuais. |
| Página visível | Subconjunto de cinco pedidos mostrado na tabela. |
| SpreadsheetML | Formato XML de planilha reconhecido pelo Excel. |
| Seed | Carga inicial repetível para preparar o ambiente. |
| Upsert | Atualização de registro existente ou criação quando ausente. |

## Perguntas que este documento responde

- Onde acessar o relatório de pedidos?
- Como o relatório convive com o carrossel no Manager?
- Quais filtros estão disponíveis?
- O Excel respeita os filtros atuais?
- A paginação limita a exportação?
- Por que um pedido pode aparecer em várias linhas da planilha?
- Quais são as 42 colunas exportadas?
- Como o valor total do produto é calculado?
- Qual endpoint fornece os pedidos?
- Como carregar pedidos demonstrativos no MongoDB?
- Por que o Manager mostra dados demonstrativos?
- Como resolver o erro `Cannot POST /orders/import`?
- Quais melhorias são recomendadas para produção?

## Referências internas do projeto

- `manager/src/App.tsx`
- `manager/src/CarouselManager.tsx`
- `manager/src/exportOrders.ts`
- `manager/src/api.ts`
- `manager/src/types.ts`
- `manager/src/data.ts`
- `manager/src/styles.css`
- `api/src/app.module.ts`
- `api/src/orders/orders.module.ts`
- `api/src/orders/orders.controller.ts`
- `api/src/orders/orders.service.ts`
- `api/src/orders/schemas/order.schema.ts`
- `api/seed/orders.json`
- `api/scripts/seed.mjs`
- `docs/marketbreja-carrossel-conhecimento.md`
