import type { Order } from './types';

type CellValue = string | number;

const columns: Array<[string, (order: Order, itemIndex: number) => CellValue]> = [
  ['Status do pedido', (order) => order.orderStatus],
  ['Status da entrega', (order) => order.deliveryStatus],
  ['Número do pedido', (order) => order.orderNumber],
  ['Número da entrega', (order) => order.deliveryNumber],
  ['Data do pedido', (order) => formatDate(order.orderDate)],
  ['Quantidade de itens', (order) => order.items.reduce((sum, item) => sum + item.quantity, 0)],
  ['Valor total', (order) => order.totalAmount],
  ['Valor do frete', (order) => order.freightAmount],
  ['Canal', (order) => order.channel],
  ['Vendido e entregue por', (order) => order.soldAndDeliveredBy],
  ['Nome do cliente', (order) => order.customer.name],
  ['Documento (CPF/CNPJ)', (order) => order.customer.document],
  ['E-mail do cliente', (order) => order.customer.email],
  ['Telefone do cliente', (order) => order.customer.phone],
  ['Gateway de pagamento', (order) => order.payment.gateway],
  ['Status do gateway', (order) => order.payment.gatewayStatus],
  ['Antifraude', (order) => order.payment.antifraud],
  ['Status do antifraude', (order) => order.payment.antifraudStatus],
  ['Forma de pagamento', (order) => order.payment.method],
  ['Data de aprovação (pago em)', (order) => order.payment.paidAt ? formatDate(order.payment.paidAt) : '—'],
  ['ID da cobrança', (order) => order.payment.chargeId],
  ['Referência', (order) => order.payment.reference],
  ['Valor estornado', (order) => order.payment.refundedAmount],
  ['Descontos aplicados', (order) => order.discounts.applied],
  ['Cupom utilizado', (order) => order.discounts.coupon],
  ['Serviço/garantia aplicado', (order) => order.discounts.service],
  ['Valor do serviço/garantia', (order) => order.discounts.serviceValue],
  ['Endereço de entrega', (order) => order.delivery.address],
  ['Endereço de cobrança', (order) => order.delivery.billingAddress],
  ['ID da cotação de frete', (order) => order.delivery.freightQuoteId],
  ['Método de envio', (order) => order.delivery.shippingMethod],
  ['Código ERP do vendedor', (order) => order.seller.erpCode],
  ['Nome do vendedor', (order) => order.seller.name],
  ['E-mail do vendedor', (order) => order.seller.email],
  ['Telefone do vendedor', (order) => order.seller.phone],
  ['Situação do vendedor', (order) => order.seller.status],
  ['SKU', (order, itemIndex) => order.items[itemIndex].sku],
  ['Título do produto', (order, itemIndex) => order.items[itemIndex].title],
  ['Produto pai', (order, itemIndex) => order.items[itemIndex].parentProduct],
  ['Preço unitário', (order, itemIndex) => order.items[itemIndex].unitPrice],
  ['Quantidade do produto', (order, itemIndex) => order.items[itemIndex].quantity],
  ['Valor total do produto', (order, itemIndex) => order.items[itemIndex].unitPrice * order.items[itemIndex].quantity],
];

const currencyColumnNames = new Set([
  'Valor total', 'Valor do frete', 'Valor estornado', 'Valor do serviço/garantia', 'Preço unitário', 'Valor total do produto',
]);

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short', timeStyle: 'short',
}).format(new Date(value));

const xmlEscape = (value: CellValue) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const cell = (value: CellValue, style = '') => {
  const type = typeof value === 'number' ? 'Number' : 'String';
  const styleAttribute = style ? ` ss:StyleID="${style}"` : '';
  return `<Cell${styleAttribute}><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
};

export function exportOrdersToExcel(orders: Order[]) {
  const rows = orders.flatMap((order) => order.items.map((_, itemIndex) => (
    `<Row>${columns.map(([name, getValue]) => cell(getValue(order, itemIndex), currencyColumnNames.has(name) ? 'Currency' : '')).join('')}</Row>`
  ))).join('');

  const worksheet = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
  <Style ss:ID="Header"><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1C5C42" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/></Style>
  <Style ss:ID="Currency"><NumberFormat ss:Format="&quot;R$&quot; #,##0.00"/></Style>
 </Styles>
 <Worksheet ss:Name="Pedidos">
  <Table>
   <Row ss:Height="24">${columns.map(([name]) => cell(name, 'Header')).join('')}</Row>
   ${rows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><AutoFilter x:Range="R1C1:R${orders.reduce((sum, order) => sum + order.items.length, 0) + 1}C${columns.length}" xmlns="urn:schemas-microsoft-com:office:excel"/></WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([worksheet], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Intl.DateTimeFormat('sv-SE').format(new Date());
  link.href = url;
  link.download = `relatorio-pedidos-${date}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
