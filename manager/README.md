# MarketBreja Manager — Relatório de pedidos

Tela React/Vite para consulta e exportação dos pedidos da loja.

- filtros por busca, status do pedido, status da entrega, canal, pagamento e período;
- indicadores e exportação calculados a partir do resultado filtrado;
- detalhes de pedido, cliente, pagamento, descontos, entrega, vendedor e produtos;
- exportação Excel (`.xls`) com uma linha por produto;
- fallback demonstrativo quando `GET /orders` estiver indisponível.

Copie `.env.example` para `.env`, execute `npm install` e `npm run dev`.

Sem filtros, todos os pedidos carregados são exibidos e exportados. Com filtros, o arquivo inclui apenas o resultado atual, independentemente da página visível na tabela.

Em `#/cross-sell`, o lojista pode criar, copiar, editar, excluir, importar e exportar regras, além de conferir em tempo real preços promocionais, descontos por pagamento e limitações de comissão 3P.
