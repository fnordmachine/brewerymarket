# Cross-sell de produtos

## Visão geral

O cross-sell é composto por três partes:

1. O Manager mantém e importa as regras comerciais.
2. A API encontra regras vigentes, resolve gatilhos e calcula todos os preços.
3. A vitrine usa o mesmo componente de oferta na página de produto e no carrinho.

Quando a API está indisponível, Manager e vitrine usam dados demonstrativos locais. Em produção, a API é a fonte de verdade para o preço exibido e enviado ao carrinho.

## Contrato da regra

```json
{
  "code": "IPA-PETISCOS",
  "internalName": "IPA com rótulos complementares",
  "active": true,
  "startsAt": "2026-01-01T00:00:00.000Z",
  "endsAt": "2028-12-31T23:59:59.999Z",
  "triggers": [
    { "type": "category", "referenceId": "ipa", "label": "IPA" }
  ],
  "suggestedProductIds": ["serra-pilsen", "aurora-sour"],
  "promotionalText": "Complete sua descoberta e ganhe um preço especial",
  "discountType": "percentage",
  "discountValue": 12,
  "discountScope": "suggested"
}
```

Valores aceitos:

- `triggers[].type`: `product`, `category` ou `collection`;
- `discountType`: `percentage`, `fixed` ou `none`;
- `discountScope`: `suggested` ou `combination`.

A coleção `top-products` demonstra o conceito de Top Product. O catálogo atribui essa coleção aos produtos elegíveis; portanto, ela participa da resolução como qualquer outra coleção.

## Endpoints

| Método | Rota | Uso |
| --- | --- | --- |
| `POST` | `/cross-sell-rules` | Criar regra |
| `GET` | `/cross-sell-rules` | Listar regras no Manager |
| `GET` | `/cross-sell-rules/:id` | Consultar uma regra |
| `PATCH` | `/cross-sell-rules/:id` | Editar regra |
| `DELETE` | `/cross-sell-rules/:id` | Excluir regra |
| `POST` | `/cross-sell-rules/import` | Criar ou atualizar regras pelo `code` |
| `GET` | `/public/products` | Catálogo usado pela demonstração |
| `POST` | `/public/cross-sell/preview` | Resolver regras e cotar combinações |

Exemplo de preview:

```json
{
  "productIds": ["nebula-ipa"],
  "paymentDiscountPercent": 5
}
```

A resposta contém as sugestões, o preço de cada linha, eventual limitação por comissão e os metadados necessários ao carrinho. `combination` contém também a cotação dos itens gatilho quando a regra aplica desconto à combinação inteira.

## Ordem dos cálculos

Para cada produto:

1. A base é `promotionalPrice`, quando preenchido; caso contrário, `price`.
2. O desconto de cross-sell percentual ou fixo é calculado sobre essa base.
3. Para produtos 3P, o desconto é reduzido até respeitar `minimumCommissionPrice`.
4. O desconto do método de pagamento é aplicado depois do cross-sell.
5. Em produtos 3P, o desconto de pagamento também é limitado pelo mesmo piso.
6. Todos os valores monetários retornam arredondados em centavos.

`cappedByCommission: true` informa à interface que algum benefício precisou ser limitado.

## Carrinho

Cada item sugerido gera uma linha própria. As linhas podem ser alteradas ou removidas sem excluir outros produtos. A demonstração adiciona também o produto gatilho ao selecionar uma oferta diretamente na página de produto, mantendo gatilho e sugestão como linhas independentes.

Metadados persistidos na linha:

```text
crosssell_rule_id
crosssell
crosssell_line_index
crosssell_discount
```

O preço exibido no componente é a cotação retornada antes da adição. Em uma integração real com checkout, esses metadados devem ser revalidados no servidor ao recalcular o carrinho; valores enviados pelo navegador não devem ser tratados como fonte de verdade.

