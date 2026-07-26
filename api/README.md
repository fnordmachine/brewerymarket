# MarketBreja API

API NestJS/Mongoose do Manager e da vitrine. Copie `.env.example` para `.env`, execute `npm install` e `npm run start:dev`.

Além dos endpoints do carrossel, a API oferece `GET /orders` para o relatório e `POST /orders/import` para a carga idempotente de pedidos. Em outro terminal, `npm run seed` cria ou atualiza o carrossel e os pedidos iniciais.
