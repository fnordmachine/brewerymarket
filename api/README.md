# MarketBreja API

API NestJS/Mongoose do Manager e da vitrine. Copie `.env.example` para `.env`, execute `npm install` e `npm run start:dev`.

Além dos endpoints do carrossel, a API oferece pedidos e o domínio de cross-sell. `POST /public/cross-sell/preview` centraliza os cálculos sobre preço promocional, desconto por pagamento e piso de comissão 3P. Em outro terminal, `npm run seed` cria ou atualiza o carrossel, os pedidos e as regras iniciais.

Detalhes e contratos: [`../docs/cross-sell.md`](../docs/cross-sell.md).
