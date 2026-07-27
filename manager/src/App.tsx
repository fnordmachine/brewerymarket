import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Beer, Bell, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Download, ExternalLink, FileSpreadsheet, Filter, LayoutGrid, Menu, MoreHorizontal,
  Package, Palette, RefreshCw, Search, Settings, ShoppingBag, SlidersHorizontal, Store, Users, X, Zap,
} from 'lucide-react';
import { getOrders } from './api';
import { emptyFilters, sampleOrders } from './data';
import { exportOrdersToExcel } from './exportOrders';
import type { Order, OrderFilters } from './types';
import CarouselManager from './CarouselManager';
import CrossSellManager from './CrossSellManager';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusTone: Record<string, string> = {
  Pago: 'green', Entregue: 'green', Aprovado: 'green', Ativo: 'green',
  'Em separação': 'blue', 'Em transporte': 'blue', 'Preparando envio': 'blue',
  'Aguardando pagamento': 'amber', 'Aguardando envio': 'amber',
  Cancelado: 'red', Cancelada: 'red', Reembolsado: 'red', Devolvida: 'red', Inativo: 'red',
};

const totalItems = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge ${statusTone[value] ?? 'gray'}`}><i />{value}</span>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <div className="select-box">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Todos</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="detail-section"><h3>{title}</h3><div className="detail-grid">{children}</div></section>;
}

function Datum({ label, value, wide = false }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return <div className={`datum ${wide ? 'wide' : ''}`}><span>{label}</span><strong>{value || '—'}</strong></div>;
}

function OrderDetails({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="details-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label={`Detalhes do pedido ${order.orderNumber}`}>
        <header className="drawer-head">
          <div><span>DETALHES DO PEDIDO</span><h2>{order.orderNumber}</h2><p>Realizado em {dateTime.format(new Date(order.orderDate))}</p></div>
          <button onClick={onClose} aria-label="Fechar detalhes"><X size={20} /></button>
        </header>
        <div className="drawer-status"><StatusBadge value={order.orderStatus} /><StatusBadge value={order.deliveryStatus} /></div>
        <div className="drawer-content">
          <InfoBlock title="Informações do pedido">
            <Datum label="Número da entrega" value={order.deliveryNumber} /><Datum label="Canal" value={order.channel} />
            <Datum label="Quantidade de itens" value={totalItems(order)} /><Datum label="Valor total" value={currency.format(order.totalAmount)} />
            <Datum label="Valor do frete" value={currency.format(order.freightAmount)} /><Datum label="Vendido e entregue por" value={order.soldAndDeliveredBy} />
          </InfoBlock>
          <InfoBlock title="Cliente">
            <Datum label="Nome" value={order.customer.name} /><Datum label="CPF/CNPJ" value={order.customer.document} />
            <Datum label="E-mail" value={order.customer.email} /><Datum label="Telefone" value={order.customer.phone} />
          </InfoBlock>
          <InfoBlock title="Pagamento">
            <Datum label="Gateway" value={order.payment.gateway} /><Datum label="Status do gateway" value={order.payment.gatewayStatus} />
            <Datum label="Antifraude" value={order.payment.antifraud} /><Datum label="Status do antifraude" value={order.payment.antifraudStatus} />
            <Datum label="Forma de pagamento" value={order.payment.method} /><Datum label="Pago em" value={order.payment.paidAt ? dateTime.format(new Date(order.payment.paidAt)) : '—'} />
            <Datum label="ID da cobrança" value={order.payment.chargeId} /><Datum label="Referência" value={order.payment.reference} />
            <Datum label="Valor estornado" value={currency.format(order.payment.refundedAmount)} />
          </InfoBlock>
          <InfoBlock title="Descontos e benefícios">
            <Datum label="Descontos aplicados" value={order.discounts.applied} /><Datum label="Cupom utilizado" value={order.discounts.coupon} />
            <Datum label="Serviço/garantia" value={order.discounts.service} /><Datum label="Valor do serviço/garantia" value={currency.format(order.discounts.serviceValue)} />
          </InfoBlock>
          <InfoBlock title="Entrega">
            <Datum label="Endereço de entrega" value={order.delivery.address} wide /><Datum label="Endereço de cobrança" value={order.delivery.billingAddress} wide />
            <Datum label="ID da cotação de frete" value={order.delivery.freightQuoteId} /><Datum label="Método de envio" value={order.delivery.shippingMethod} />
          </InfoBlock>
          <InfoBlock title="Vendedor">
            <Datum label="Código ERP" value={order.seller.erpCode} /><Datum label="Nome" value={order.seller.name} />
            <Datum label="E-mail" value={order.seller.email} /><Datum label="Telefone" value={order.seller.phone} />
            <Datum label="Situação" value={<StatusBadge value={order.seller.status} />} />
          </InfoBlock>
          <section className="detail-section products-section">
            <h3>Produtos do pedido <span>{order.items.length}</span></h3>
            <div className="products-table-wrap"><table className="products-table"><thead><tr><th>SKU / Produto</th><th>Preço unit.</th><th>Qtd.</th><th>Total</th></tr></thead><tbody>
              {order.items.map((item) => <tr key={item.sku}><td><strong>{item.title}</strong><span>{item.sku} · Produto pai: {item.parentProduct}</span></td><td>{currency.format(item.unitPrice)}</td><td>{item.quantity}</td><td><strong>{currency.format(item.unitPrice * item.quantity)}</strong></td></tr>)}
            </tbody></table></div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function OrdersReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<OrderFilters>(emptyFilters);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');
  const pageSize = 5;

  useEffect(() => {
    const controller = new AbortController();
    void getOrders(controller.signal)
      .then((result) => { setOrders(result); setDemoMode(false); })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setOrders(sampleOrders); setDemoMode(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const options = useMemo(() => ({
    orderStatus: [...new Set(orders.map((order) => order.orderStatus))],
    deliveryStatus: [...new Set(orders.map((order) => order.deliveryStatus))],
    channel: [...new Set(orders.map((order) => order.channel))],
    paymentMethod: [...new Set(orders.map((order) => order.payment.method))],
  }), [orders]);

  const filteredOrders = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase('pt-BR').replace(/^#/, '');
    return orders.filter((order) => {
      const searchable = [order.orderNumber.replace(/^#/, ''), order.deliveryNumber, order.customer.name, order.customer.document, order.customer.email]
        .join(' ').toLocaleLowerCase('pt-BR');
      return (!search || searchable.includes(search))
        && (!filters.orderStatus || order.orderStatus === filters.orderStatus)
        && (!filters.deliveryStatus || order.deliveryStatus === filters.deliveryStatus)
        && (!filters.channel || order.channel === filters.channel)
        && (!filters.paymentMethod || order.payment.method === filters.paymentMethod)
        && (!filters.startDate || order.orderDate.slice(0, 10) >= filters.startDate)
        && (!filters.endDate || order.orderDate.slice(0, 10) <= filters.endDate);
    });
  }, [filters, orders]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const filteredRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const exportedRows = filteredOrders.reduce((sum, order) => sum + order.items.length, 0);

  useEffect(() => setPage(1), [filters]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const updateFilter = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => setFilters(emptyFilters);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const handleExport = () => {
    if (!filteredOrders.length) return;
    exportOrdersToExcel(filteredOrders);
    showToast(`Relatório gerado com ${filteredOrders.length} pedido${filteredOrders.length === 1 ? '' : 's'} e ${exportedRows} linha${exportedRows === 1 ? '' : 's'} de produto.`);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Beer size={22} /></div><div><strong>MarketBreja</strong><span>portal do cervejeiro</span></div><button onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><X size={20} /></button></div>
        <nav>
          <small>OPERAÇÃO</small>
          <a><LayoutGrid size={18} /> Visão geral</a><a><Package size={18} /> Produtos <span>248</span></a><a className="active" href="#/pedidos"><ShoppingBag size={18} /> Pedidos</a>
          <small>LOJA ONLINE</small>
          <a href="#/cross-sell"><Zap size={18} /> Cross-sell</a><a href="#/personalizacao/carrossel"><Palette size={18} /> Personalização</a><a><Store size={18} /> Páginas</a><a><Zap size={18} /> Integrações</a>
          <small>GESTÃO</small>
          <a><BarChart3 size={18} /> Relatórios</a><a><Users size={18} /> Clientes</a><a><Settings size={18} /> Configurações</a><a><BookOpen size={18} /> Conteúdos</a>
        </nav>
        <div className="sidebar-help"><div><CircleHelp size={19} /></div><strong>Precisa de ajuda?</strong><span>Converse com nosso time</span><button>Falar com suporte</button></div>
        <div className="account"><div className="avatar">AM</div><div><strong>Adriana Martins</strong><span>Cervejaria Três Lagos</span></div><MoreHorizontal size={18} /></div>
      </aside>

      <main>
        <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={21} /></button><div className="crumb"><span>Operação</span><ChevronRight size={14} /><strong>Pedidos</strong></div><div className="top-actions"><button aria-label="Buscar"><Search size={19} /></button><button aria-label="Notificações"><Bell size={19} /><i /></button><div className="header-avatar">AM</div></div></header>
        <div className="content">
          <div className="page-heading">
            <div><div className="page-icon"><FileSpreadsheet size={21} /></div><div><div className={`eyebrow ${demoMode ? 'offline' : ''}`}><span className="live-dot" />{demoMode ? 'DADOS DEMONSTRATIVOS' : 'DADOS ATUALIZADOS'}</div><h1>Relatório de pedidos</h1><p>Consulte sua operação e exporte os dados completos para o Excel.</p></div></div>
            <div className="heading-actions"><button className="btn secondary" onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={17} /> Filtros {activeFilterCount > 0 && <span className="button-count">{activeFilterCount}</span>}</button><button className="btn primary" onClick={handleExport} disabled={!filteredOrders.length || loading}><Download size={17} /> Exportar Excel</button></div>
          </div>

          <section className="summary-grid" aria-label="Resumo dos pedidos">
            <div className="summary-card"><span>Pedidos encontrados</span><strong>{loading ? '—' : filteredOrders.length}</strong><small>{activeFilterCount ? 'no resultado filtrado' : 'em toda a loja'}</small><div className="summary-icon green"><ShoppingBag size={18} /></div></div>
            <div className="summary-card"><span>Valor dos pedidos</span><strong>{loading ? '—' : currency.format(filteredRevenue)}</strong><small>soma do resultado atual</small><div className="summary-icon lime"><BarChart3 size={18} /></div></div>
            <div className="summary-card"><span>Itens vendidos</span><strong>{loading ? '—' : filteredOrders.reduce((sum, order) => sum + totalItems(order), 0)}</strong><small>unidades no resultado</small><div className="summary-icon amber"><Package size={18} /></div></div>
          </section>

          <section className={`filters-card ${filtersOpen ? 'is-open' : ''}`}>
            <div className="filters-title"><div><Filter size={17} /><div><strong>Filtrar pedidos</strong><span>O Excel respeitará exatamente estes filtros.</span></div></div><button onClick={() => setFiltersOpen((open) => !open)} aria-label="Alternar filtros"><ChevronDown size={18} /></button></div>
            {filtersOpen && <div className="filters-body">
              <label className="filter-field search-field"><span>Buscar pedido ou cliente</span><div className="search-box"><Search size={16} /><input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Número, nome, documento ou e-mail" />{filters.search && <button onClick={() => updateFilter('search', '')} aria-label="Limpar busca"><X size={14} /></button>}</div></label>
              <SelectField label="Status do pedido" value={filters.orderStatus} options={options.orderStatus} onChange={(value) => updateFilter('orderStatus', value)} />
              <SelectField label="Status da entrega" value={filters.deliveryStatus} options={options.deliveryStatus} onChange={(value) => updateFilter('deliveryStatus', value)} />
              <SelectField label="Canal" value={filters.channel} options={options.channel} onChange={(value) => updateFilter('channel', value)} />
              <SelectField label="Forma de pagamento" value={filters.paymentMethod} options={options.paymentMethod} onChange={(value) => updateFilter('paymentMethod', value)} />
              <label className="filter-field"><span>Data inicial</span><div className="date-box"><CalendarDays size={15} /><input type="date" value={filters.startDate} max={filters.endDate || undefined} onChange={(event) => updateFilter('startDate', event.target.value)} /></div></label>
              <label className="filter-field"><span>Data final</span><div className="date-box"><CalendarDays size={15} /><input type="date" value={filters.endDate} min={filters.startDate || undefined} onChange={(event) => updateFilter('endDate', event.target.value)} /></div></label>
              <div className="filter-actions"><button onClick={clearFilters} disabled={!activeFilterCount}><RefreshCw size={14} /> Limpar filtros</button></div>
            </div>}
          </section>

          <section className="orders-card">
            <div className="orders-head"><div><h2>Pedidos</h2><p>{filteredOrders.length} resultado{filteredOrders.length === 1 ? '' : 's'} · a exportação inclui {exportedRows} linha{exportedRows === 1 ? '' : 's'} de produto</p></div><div className="excel-hint"><FileSpreadsheet size={16} /><span><strong>Planilha completa</strong>Todos os {42} campos obrigatórios</span></div></div>
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th>Entrega</th><th>Canal</th><th>Itens</th><th>Valor total</th><th aria-label="Ações" /></tr></thead>
                <tbody>
                  {loading && Array.from({ length: 4 }, (_, index) => <tr className="skeleton-row" key={index}><td colSpan={8}><span /></td></tr>)}
                  {!loading && visibleOrders.map((order) => <tr key={order.id} onClick={() => setSelectedOrder(order)}>
                    <td><strong>{order.orderNumber}</strong><span>{dateTime.format(new Date(order.orderDate))}</span></td>
                    <td><strong>{order.customer.name}</strong><span>{order.customer.email}</span></td>
                    <td><StatusBadge value={order.orderStatus} /></td><td><StatusBadge value={order.deliveryStatus} /><span className="delivery-number">{order.deliveryNumber}</span></td>
                    <td><span className="channel-pill">{order.channel}</span></td><td><strong>{totalItems(order)}</strong><span>{order.items.length} SKU{order.items.length === 1 ? '' : 's'}</span></td><td className="amount">{currency.format(order.totalAmount)}</td>
                    <td><button className="row-action" onClick={(event) => { event.stopPropagation(); setSelectedOrder(order); }} aria-label={`Abrir ${order.orderNumber}`}><ExternalLink size={16} /></button></td>
                  </tr>)}
                </tbody>
              </table>
              {!loading && !visibleOrders.length && <div className="empty-state"><div><Search size={24} /></div><h3>Nenhum pedido encontrado</h3><p>Revise os filtros para ampliar sua busca.</p><button onClick={clearFilters}>Limpar todos os filtros</button></div>}
            </div>
            {!loading && filteredOrders.length > 0 && <footer className="table-footer"><span>Exibindo {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredOrders.length)} de {filteredOrders.length} pedidos</span><div className="pagination"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, index) => <button key={index} className={page === index + 1 ? 'active' : ''} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button></div></footer>}
          </section>
        </div>
      </main>
      {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      {toast && <div className="toast"><Check size={17} /><span>{toast}</span></div>}
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/pedidos');

  useEffect(() => {
    const handleRoute = () => setRoute(window.location.hash || '#/pedidos');
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  if (route.startsWith('#/personalizacao')) return <CarouselManager />;
  if (route.startsWith('#/cross-sell')) return <CrossSellManager />;
  return <OrdersReport />;
}
