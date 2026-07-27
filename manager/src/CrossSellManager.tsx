import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Beer, Bell, Check, ChevronRight, CircleHelp, Copy, Download,
  Edit3, FileUp, LayoutGrid, Menu, MoreHorizontal, Package, Plus, Save, Search, ShoppingBag,
  Sparkles, Store, Tag, Trash2, Users, X, Zap,
} from 'lucide-react';
import {
  deleteCrossSellRule, getCatalog, getCrossSellRules, importCrossSellRules, saveCrossSellRule,
} from './api';
import type { CatalogProduct, CrossSellRule, CrossSellTargetType } from './types';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const today = new Date().toISOString().slice(0, 10);

const demoCatalog: CatalogProduct[] = [
  { id: 'nebula-ipa', sku: 'MB-IPA-001', name: 'Nebulosa', style: 'American IPA', categoryIds: ['cervejas', 'ipa'], collectionIds: ['top-products', 'lupuladas'], price: 24.9, promotionalPrice: 21.9, sellerType: '1P', sellerName: 'MarketBreja', tone: 'amber' },
  { id: 'serra-pilsen', sku: 'MB-PIL-002', name: 'Serra Clara', style: 'Pilsen', categoryIds: ['cervejas', 'pilsen'], collectionIds: ['top-products', 'leves'], price: 16.5, sellerType: '1P', sellerName: 'MarketBreja', tone: 'gold' },
  { id: 'noite-stout', sku: '3P-STO-013', name: 'Noite Sem Fim', style: 'Imperial Stout', categoryIds: ['cervejas', 'stout'], collectionIds: ['escuras'], price: 29.9, promotionalPrice: 27.9, sellerType: '3P', sellerName: 'Cervejaria Horizonte', minimumCommissionPrice: 25.5, tone: 'dark' },
  { id: 'aurora-sour', sku: '3P-SOU-008', name: 'Aurora Vermelha', style: 'Fruit Sour', categoryIds: ['cervejas', 'sour'], collectionIds: ['top-products', 'frutadas'], price: 22, sellerType: '3P', sellerName: 'Casa Selvagem', minimumCommissionPrice: 19.4, tone: 'red' },
];

const demoRules: CrossSellRule[] = [{
  _id: 'demo-ipa', code: 'IPA-PETISCOS', internalName: 'IPA com rótulos complementares', active: true,
  startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2028-12-31T23:59:59.999Z',
  triggers: [{ type: 'category', referenceId: 'ipa', label: 'IPA' }],
  suggestedProductIds: ['serra-pilsen', 'aurora-sour'], promotionalText: 'Complete sua descoberta e ganhe um preço especial',
  discountType: 'percentage', discountValue: 12, discountScope: 'suggested',
}];

const emptyRule = (): CrossSellRule => ({
  code: '', internalName: '', active: true, startsAt: `${today}T00:00:00.000Z`, endsAt: '2028-12-31T23:59:59.999Z',
  triggers: [{ type: 'product', referenceId: 'nebula-ipa', label: 'Nebulosa' }], suggestedProductIds: [],
  promotionalText: 'Leve junto e aproveite uma condição exclusiva', discountType: 'percentage', discountValue: 10,
  discountScope: 'suggested',
});

function Sidebar({ open, close }: { open: boolean; close: () => void }) {
  return <aside className={`sidebar ${open ? 'is-open' : ''}`}>
    <div className="brand"><div className="brand-mark"><Beer size={22} /></div><div><strong>MarketBreja</strong><span>portal do cervejeiro</span></div><button onClick={close}><X size={20} /></button></div>
    <nav><small>OPERAÇÃO</small><a><LayoutGrid size={18} /> Visão geral</a><a><Package size={18} /> Produtos <span>248</span></a><a href="#/pedidos"><ShoppingBag size={18} /> Pedidos</a><small>LOJA ONLINE</small><a className="active" href="#/cross-sell"><Sparkles size={18} /> Cross-sell</a><a href="#/personalizacao/carrossel"><Store size={18} /> Personalização</a><a><Zap size={18} /> Integrações</a><small>GESTÃO</small><a><Users size={18} /> Clientes</a></nav>
    <div className="sidebar-help"><div><CircleHelp size={19} /></div><strong>Precisa de ajuda?</strong><span>Converse com nosso time</span><button>Falar com suporte</button></div>
    <div className="account"><div className="avatar">AM</div><div><strong>Adriana Martins</strong><span>Cervejaria Três Lagos</span></div><MoreHorizontal size={18} /></div>
  </aside>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={`xs-toggle ${value ? 'active' : ''}`} onClick={() => onChange(!value)} aria-pressed={value}><span /></button>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="xs-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function discountPreview(product: CatalogProduct, rule: CrossSellRule, paymentPercent: number) {
  const base = product.promotionalPrice ?? product.price;
  const requested = rule.discountType === 'percentage' ? base * Math.min(rule.discountValue, 100) / 100 : rule.discountType === 'fixed' ? rule.discountValue : 0;
  const floor = product.sellerType === '3P' ? product.minimumCommissionPrice ?? base : 0;
  const crosssell = Math.min(requested, Math.max(0, base - floor));
  const payment = Math.min((base - crosssell) * paymentPercent / 100, Math.max(0, base - crosssell - floor));
  return { base, discount: crosssell, final: base - crosssell - payment, capped: crosssell + .001 < requested || payment + .001 < (base - crosssell) * paymentPercent / 100 };
}

export default function CrossSellManager() {
  const [rules, setRules] = useState<CrossSellRule[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>(demoCatalog);
  const [editing, setEditing] = useState<CrossSellRule | null>(null);
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [paymentPercent, setPaymentPercent] = useState(5);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void Promise.all([getCrossSellRules(), getCatalog()]).then(([savedRules, savedCatalog]) => {
      setRules(savedRules); setCatalog(savedCatalog); setConnected(true);
    }).catch(() => {
      const local = localStorage.getItem('marketbreja-cross-sell-rules');
      if (local) {
        try { setRules(JSON.parse(local) as CrossSellRule[]); }
        catch { localStorage.removeItem('marketbreja-cross-sell-rules'); setRules(demoRules); }
      } else setRules(demoRules);
      setConnected(false);
    });
  }, []);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const filtered = rules.filter((rule) => `${rule.internalName} ${rule.code}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  const update = <K extends keyof CrossSellRule>(key: K, value: CrossSellRule[K]) => setEditing((current) => current ? { ...current, [key]: value } : current);
  const suggested = useMemo(() => editing ? catalog.filter((product) => editing.suggestedProductIds.includes(product.id)) : [], [catalog, editing]);

  const persistLocal = (next: CrossSellRule[]) => { setRules(next); localStorage.setItem('marketbreja-cross-sell-rules', JSON.stringify(next)); };
  const handleSave = async () => {
    if (!editing || !editing.internalName.trim() || !editing.code || !editing.suggestedProductIds.length || !editing.triggers.length) return showToast('Preencha nome, código, gatilho e ao menos um produto sugerido.');
    if (new Date(editing.endsAt) < new Date(editing.startsAt)) return showToast('A data final deve ser posterior à data inicial.');
    setSaving(true);
    try {
      const saved = await saveCrossSellRule(editing);
      setRules((current) => current.some((rule) => rule._id === saved._id) ? current.map((rule) => rule._id === saved._id ? saved : rule) : [saved, ...current]);
      setEditing(null); setConnected(true); showToast('Regra salva e pronta para a jornada de compra.');
    } catch {
      const localRule = { ...editing, _id: editing._id ?? `local-${crypto.randomUUID()}` };
      const next = rules.some((rule) => rule._id === localRule._id) ? rules.map((rule) => rule._id === localRule._id ? localRule : rule) : [localRule, ...rules];
      persistLocal(next); setEditing(null); setConnected(false); showToast('Regra salva localmente.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (rule: CrossSellRule) => {
    if (!window.confirm(`Excluir a regra “${rule.internalName}”?`)) return;
    try { if (rule._id && !rule._id.startsWith('local-') && rule._id !== 'demo-ipa') await deleteCrossSellRule(rule._id); } catch { return showToast('Não foi possível excluir a regra.'); }
    persistLocal(rules.filter((item) => item._id !== rule._id)); showToast('Regra excluída.');
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as CrossSellRule[] | { rules: CrossSellRule[] };
      const imported = Array.isArray(parsed) ? parsed : parsed.rules;
      if (!Array.isArray(imported) || !imported.length) throw new Error();
      if (connected) {
        await importCrossSellRules(imported);
        const refreshed = await getCrossSellRules();
        setRules(refreshed); localStorage.setItem('marketbreja-cross-sell-rules', JSON.stringify(refreshed));
        showToast(`${imported.length} regra${imported.length === 1 ? '' : 's'} importada${imported.length === 1 ? '' : 's'}.`);
        return;
      }
      const byCode = new Map([...rules, ...imported].map((rule) => [rule.code, rule]));
      persistLocal([...byCode.values()]); showToast(`${imported.length} regra${imported.length === 1 ? '' : 's'} importada${imported.length === 1 ? '' : 's'}.`);
    } catch { showToast('Arquivo inválido. Importe um JSON no contrato de regras.'); }
    finally { if (importInput.current) importInput.current.value = ''; }
  };

  const exportRules = () => {
    const blob = new Blob([JSON.stringify({ rules: rules.map(({ _id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rule }) => rule) }, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = 'cross-sell-rules.json'; anchor.click(); URL.revokeObjectURL(anchor.href);
  };

  const toggleSuggested = (id: string) => editing && update('suggestedProductIds', editing.suggestedProductIds.includes(id) ? editing.suggestedProductIds.filter((value) => value !== id) : [...editing.suggestedProductIds, id]);
  const setTrigger = (index: number, patch: Partial<CrossSellRule['triggers'][number]>) => editing && update('triggers', editing.triggers.map((trigger, current) => current === index ? { ...trigger, ...patch } : trigger));

  return <div className="app-shell xs-page">
    <Sidebar open={sidebarOpen} close={() => setSidebarOpen(false)} />
    <main><header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button><div className="crumb"><span>Loja online</span><ChevronRight size={14} /><strong>Cross-sell</strong></div><div className="top-actions"><button><Search size={19} /></button><button><Bell size={19} /><i /></button><div className="header-avatar">AM</div></div></header>
      <div className="content">
        <div className="page-heading"><div>{editing && <button className="xs-back" onClick={() => setEditing(null)}><ArrowLeft size={18} /></button>}<div><div className={`eyebrow ${connected ? '' : 'offline'}`}><span className="live-dot" />{connected ? 'API CONECTADA' : 'MODO LOCAL'}</div><h1>{editing ? editing._id ? 'Editar regra' : 'Nova regra' : 'Cross-sell de produtos'}</h1><p>{editing ? 'Configure os gatilhos, benefícios e produtos da combinação.' : 'Crie campanhas de venda complementar sem comprometer preços e comissões.'}</p></div></div>
          <div className="heading-actions">{editing ? <><button className="btn secondary" onClick={() => setEditing(null)}>Cancelar</button><button className="btn primary" onClick={() => void handleSave()} disabled={saving}><Save size={17} />{saving ? 'Salvando...' : 'Salvar regra'}</button></> : <><button className="btn secondary" onClick={() => importInput.current?.click()}><FileUp size={17} /> Importar</button><button className="btn secondary" onClick={exportRules} disabled={!rules.length}><Download size={17} /> Exportar</button><button className="btn primary" onClick={() => setEditing(emptyRule())}><Plus size={17} /> Nova regra</button></>}</div>
        </div>
        <input ref={importInput} className="xs-hidden" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />

        {!editing ? <>
          <section className="summary-grid"><div className="summary-card"><span>Regras cadastradas</span><strong>{rules.length}</strong><small>campanhas configuradas</small><div className="summary-icon green"><Sparkles size={18} /></div></div><div className="summary-card"><span>Ativas agora</span><strong>{rules.filter((rule) => rule.active && rule.startsAt.slice(0, 10) <= today && rule.endsAt.slice(0, 10) >= today).length}</strong><small>dentro da vigência</small><div className="summary-icon lime"><Zap size={18} /></div></div><div className="summary-card"><span>Produtos sugeridos</span><strong>{new Set(rules.flatMap((rule) => rule.suggestedProductIds)).size}</strong><small>itens únicos nas ofertas</small><div className="summary-icon amber"><Package size={18} /></div></div></section>
          <section className="xs-list-card"><div className="xs-list-head"><div><h2>Regras de cross-sell</h2><p>Produtos, categorias e coleções podem disparar uma oferta.</p></div><label><Search size={16} /><input placeholder="Buscar regra" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
            <div className="xs-table-wrap"><table><thead><tr><th>Regra</th><th>Gatilho</th><th>Oferta</th><th>Vigência</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((rule) => <tr key={rule._id ?? rule.code}><td><strong>{rule.internalName}</strong><span>{rule.code}</span></td><td><strong>{rule.triggers.length}</strong><span>{rule.triggers.map((trigger) => trigger.label).join(', ')}</span></td><td><strong>{rule.suggestedProductIds.length} produto{rule.suggestedProductIds.length === 1 ? '' : 's'}</strong><span>{rule.discountType === 'none' ? 'Sem desconto' : `${rule.discountType === 'percentage' ? `${rule.discountValue}%` : currency.format(rule.discountValue)} · ${rule.discountScope === 'suggested' ? 'sugeridos' : 'combinação'}`}</span></td><td><strong>{new Date(rule.startsAt).toLocaleDateString('pt-BR')}</strong><span>até {new Date(rule.endsAt).toLocaleDateString('pt-BR')}</span></td><td><span className={`status-badge ${rule.active ? 'green' : 'gray'}`}><i />{rule.active ? 'Ativa' : 'Inativa'}</span></td><td><div className="xs-row-actions"><button onClick={() => setEditing({ ...rule })}><Edit3 size={15} /></button><button onClick={() => setEditing({ ...rule, _id: undefined, code: `${rule.code}-COPIA`, internalName: `${rule.internalName} (cópia)` })}><Copy size={15} /></button><button className="danger" onClick={() => void handleDelete(rule)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state"><Sparkles size={25} /><h3>Nenhuma regra encontrada</h3><p>Crie sua primeira campanha de venda complementar.</p></div>}</div>
          </section>
        </> : <div className="xs-workspace">
          <section className="xs-form-card"><div className="xs-form-section"><div className="xs-section-title"><Tag size={18} /><div><h2>Identificação e vigência</h2><p>Informações internas e janela de exibição.</p></div></div><div className="xs-grid"><Field label="Nome interno"><input value={editing.internalName} onChange={(event) => update('internalName', event.target.value)} /></Field><Field label="Código da regra"><input value={editing.code} onChange={(event) => update('code', event.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, ''))} /></Field><Field label="Início da vigência"><input type="date" value={editing.startsAt.slice(0, 10)} onChange={(event) => update('startsAt', `${event.target.value}T00:00:00.000Z`)} /></Field><Field label="Fim da vigência"><input type="date" value={editing.endsAt.slice(0, 10)} onChange={(event) => update('endsAt', `${event.target.value}T23:59:59.999Z`)} /></Field></div><div className="xs-switch-row"><div><strong>Regra ativa</strong><span>A oferta só aparece durante a vigência.</span></div><Toggle value={editing.active} onChange={(value) => update('active', value)} /></div></div>

            <div className="xs-form-section"><div className="xs-section-title"><Zap size={18} /><div><h2>Gatilhos</h2><p>Qualquer um destes alvos poderá disparar a regra.</p></div></div>{editing.triggers.map((trigger, index) => <div className="xs-trigger-row" key={index}><Field label="Tipo"><select value={trigger.type} onChange={(event) => setTrigger(index, { type: event.target.value as CrossSellTargetType, referenceId: '', label: '' })}><option value="product">Produto</option><option value="category">Categoria</option><option value="collection">Coleção</option></select></Field><Field label="Identificador"><input value={trigger.referenceId} placeholder="Ex.: ipa" onChange={(event) => setTrigger(index, { referenceId: event.target.value })} /></Field><Field label="Nome exibido"><input value={trigger.label} placeholder="Ex.: Cervejas IPA" onChange={(event) => setTrigger(index, { label: event.target.value })} /></Field><button onClick={() => update('triggers', editing.triggers.filter((_, current) => current !== index))}><Trash2 size={16} /></button></div>)}<button className="xs-add-line" onClick={() => update('triggers', [...editing.triggers, { type: 'product', referenceId: '', label: '' }])}><Plus size={15} /> Adicionar gatilho</button></div>

            <div className="xs-form-section"><div className="xs-section-title"><Package size={18} /><div><h2>Produtos sugeridos</h2><p>Entram no carrinho como linhas independentes.</p></div></div><div className="xs-product-picker">{catalog.map((product) => <button type="button" key={product.id} className={editing.suggestedProductIds.includes(product.id) ? 'selected' : ''} onClick={() => toggleSuggested(product.id)}><span className={`xs-product-dot ${product.tone}`}>{editing.suggestedProductIds.includes(product.id) && <Check size={13} />}</span><span><strong>{product.name}</strong><small>{product.sku} · {product.sellerType}</small></span><b>{currency.format(product.promotionalPrice ?? product.price)}</b></button>)}</div></div>

            <div className="xs-form-section"><div className="xs-section-title"><Tag size={18} /><div><h2>Benefício</h2><p>O preço promocional é sempre a base do cálculo.</p></div></div><Field label="Texto promocional"><input value={editing.promotionalText} onChange={(event) => update('promotionalText', event.target.value)} /></Field><div className="xs-grid"><Field label="Tipo de desconto"><select value={editing.discountType} onChange={(event) => { const type = event.target.value as CrossSellRule['discountType']; update('discountType', type); if (type === 'none') update('discountValue', 0); }}><option value="percentage">Percentual</option><option value="fixed">Valor fixo</option><option value="none">Sem desconto</option></select></Field><Field label="Valor"><input type="number" min="0" max={editing.discountType === 'percentage' ? 100 : undefined} step="0.01" disabled={editing.discountType === 'none'} value={editing.discountValue} onChange={(event) => update('discountValue', Number(event.target.value))} /></Field></div><Field label="Aplicar desconto"><div className="xs-radio-group"><button type="button" className={editing.discountScope === 'suggested' ? 'active' : ''} onClick={() => update('discountScope', 'suggested')}><span />Apenas nos sugeridos</button><button type="button" className={editing.discountScope === 'combination' ? 'active' : ''} onClick={() => update('discountScope', 'combination')}><span />Em toda a combinação</button></div></Field></div>
          </section>

          <aside className="xs-preview"><div className="xs-preview-head"><div><span>PREVIEW EM TEMPO REAL</span><h2>Como o cliente verá</h2></div><Sparkles size={20} /></div><div className="xs-offer"><small>LEVE TAMBÉM</small><h3>{editing.promotionalText || 'Sua mensagem promocional'}</h3><div className="xs-payment"><span>Desconto no pagamento</span><select value={paymentPercent} onChange={(event) => setPaymentPercent(Number(event.target.value))}><option value="0">Nenhum</option><option value="5">Pix · 5%</option><option value="10">Pix · 10%</option></select></div>{suggested.map((product) => { const price = discountPreview(product, editing, paymentPercent); return <article key={product.id}><div className={`xs-can ${product.tone}`}><Beer size={17} /></div><div><strong>{product.name}</strong><span>{product.style} · {product.sellerType}</span>{price.capped && <small>Desconto limitado pela comissão mínima</small>}</div><div><del>{price.discount > 0 || product.promotionalPrice ? currency.format(product.price) : ''}</del><strong>{currency.format(price.final)}</strong><span>economize {currency.format(product.price - price.final)}</span></div></article>; })}{!suggested.length && <div className="xs-preview-empty"><Package size={25} /><span>Selecione produtos para visualizar preços e limites.</span></div>}<button className="xs-preview-cta" disabled={!suggested.length}>Adicionar selecionados <ShoppingBag size={16} /></button><p><Check size={13} /> Cada produto poderá ser removido separadamente no carrinho.</p></div></aside>
        </div>}
      </div>
    </main>{toast && <div className="toast"><Check size={17} /><span>{toast}</span></div>}
  </div>;
}
