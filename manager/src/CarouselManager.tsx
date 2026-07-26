import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowUp, Beer, Bell, BookOpen, Check, ChevronDown, ChevronRight, Cherry,
  CircleHelp, Coffee, Eye, Flame, Gift, ImagePlus, LayoutGrid, Leaf, Menu, Monitor, MoreHorizontal,
  Package, Palette, Plus, Save, Search, Settings, ShoppingBag, Smartphone, Sparkles, Store, Trash2,
  Upload, Wheat, X, Zap, type LucideIcon,
} from 'lucide-react';
import { getCarousels, saveCarousel, uploadImage } from './api';
import { destinationLabels, destinationOptions, initialCarousel } from './data';
import type { DestinationType, NavigationCarousel, NavigationItem } from './types';

type Tab = 'general' | 'items' | 'appearance' | 'responsive';
const iconLibrary: Record<string, LucideIcon> = { Beer, Wheat, Coffee, Cherry, Leaf, Gift, Flame, Sparkles, ShoppingBag, Package, Store, Zap };

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={`c-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="c-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function ManagerSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <aside className={`sidebar ${open ? 'is-open' : ''}`}>
    <div className="brand"><div className="brand-mark"><Beer size={22} /></div><div><strong>MarketBreja</strong><span>portal do cervejeiro</span></div><button onClick={onClose}><X size={20} /></button></div>
    <nav>
      <small>OPERAÇÃO</small><a><LayoutGrid size={18} /> Visão geral</a><a><Package size={18} /> Produtos <span>248</span></a><a href="#/pedidos"><ShoppingBag size={18} /> Pedidos</a>
      <small>LOJA ONLINE</small><a className="active" href="#/personalizacao/carrossel"><Palette size={18} /> Personalização</a><a><Store size={18} /> Páginas</a><a><Zap size={18} /> Integrações</a>
      <small>GESTÃO</small><a><Settings size={18} /> Configurações</a><a><BookOpen size={18} /> Conteúdos</a>
    </nav>
    <div className="sidebar-help"><div><CircleHelp size={19} /></div><strong>Precisa de ajuda?</strong><span>Converse com nosso time</span><button>Falar com suporte</button></div>
    <div className="account"><div className="avatar">AM</div><div><strong>Adriana Martins</strong><span>Cervejaria Três Lagos</span></div><MoreHorizontal size={18} /></div>
  </aside>;
}

function Preview({ carousel, viewport }: { carousel: NavigationCarousel; viewport: 'desktop' | 'mobile' }) {
  const style = {
    '--c-section': carousel.sectionBackground, '--c-background': carousel.style.backgroundColor,
    '--c-text': carousel.style.textColor, '--c-border': carousel.style.borderColor,
    '--c-border-width': `${carousel.style.borderWidth}px`, '--c-radius': `${carousel.style.borderRadius}px`,
    '--c-gap': `${carousel.responsive.gap}px`, '--c-columns': viewport === 'desktop' ? carousel.responsive.desktopItems : carousel.responsive.mobileItems,
  } as React.CSSProperties;
  return <div className={`c-store-preview ${viewport} shape-${carousel.responsive.itemShape} shadow-${carousel.style.shadow}`} style={style}>
    <div className="c-browser"><i /><i /><i /><span /></div>
    <div className="c-store-head"><div className="c-logo">MB</div><div className="c-search" /><ShoppingBag size={17} /></div>
    <section className="c-preview-section">
      {carousel.showTitle && <div className="c-preview-title"><div><small>DESCUBRA NOVOS SABORES</small><h2>{carousel.title || 'Título do carrossel'}</h2></div><span>Ver todos <ChevronRight size={12} /></span></div>}
      <div className="c-preview-items">{carousel.items.filter((item) => item.active).map((item) => {
        const Icon = iconLibrary[item.image.value] ?? ImagePlus;
        return <div className="c-preview-item" key={item.id}><div className="c-preview-art">{item.image.source === 'upload' ? <img src={item.image.value} alt={item.image.alt} /> : <Icon />}</div><strong>{item.name}</strong><span>Explorar <ChevronRight size={10} /></span></div>;
      })}</div>
    </section>
    <div className="c-preview-footer"><i /><i /><i /></div>
  </div>;
}

export default function CarouselManager() {
  const [carousel, setCarousel] = useState<NavigationCarousel>(initialCarousel);
  const [tab, setTab] = useState<Tab>('items');
  const [selectedId, setSelectedId] = useState(initialCarousel.items[0]?.id ?? '');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const selectedItem = useMemo(() => carousel.items.find((item) => item.id === selectedId), [carousel.items, selectedId]);

  useEffect(() => {
    void getCarousels().then(([saved]) => {
      setConnected(true);
      if (saved) { setCarousel(saved); setSelectedId(saved.items[0]?.id ?? ''); }
    }).catch(() => {
      const draft = localStorage.getItem('marketbreja-carousel');
      if (draft) try { const saved = JSON.parse(draft) as NavigationCarousel; setCarousel(saved); setSelectedId(saved.items[0]?.id ?? ''); } catch { localStorage.removeItem('marketbreja-carousel'); }
    });
  }, []);

  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000); };
  const update = <K extends keyof NavigationCarousel>(key: K, value: NavigationCarousel[K]) => setCarousel((current) => ({ ...current, [key]: value }));
  const updateStyle = <K extends keyof NavigationCarousel['style']>(key: K, value: NavigationCarousel['style'][K]) => setCarousel((current) => ({ ...current, style: { ...current.style, [key]: value } }));
  const updateResponsive = <K extends keyof NavigationCarousel['responsive']>(key: K, value: NavigationCarousel['responsive'][K]) => setCarousel((current) => ({ ...current, responsive: { ...current.responsive, [key]: value } }));
  const updateItem = (patch: Partial<NavigationItem>) => setCarousel((current) => ({ ...current, items: current.items.map((item) => item.id === selectedId ? { ...item, ...patch } : item) }));
  const updateDestination = (patch: Partial<NavigationItem['destination']>) => selectedItem && updateItem({ destination: { ...selectedItem.destination, ...patch } });

  const addItem = () => {
    const next: NavigationItem = { id: crypto.randomUUID(), name: 'Novo item', image: { source: 'icon', value: 'Beer', alt: 'Novo item' }, destination: { type: 'category', value: 'Cervejas', label: 'Cervejas', openInNewTab: false }, active: true, order: carousel.items.length };
    setCarousel((current) => ({ ...current, items: [...current.items, next] })); setSelectedId(next.id); setTab('items');
  };
  const removeItem = () => {
    const items = carousel.items.filter((item) => item.id !== selectedId).map((item, order) => ({ ...item, order }));
    setCarousel((current) => ({ ...current, items })); setSelectedId(items[0]?.id ?? '');
  };
  const moveItem = (direction: -1 | 1) => {
    const index = carousel.items.findIndex((item) => item.id === selectedId); const target = index + direction;
    if (index < 0 || target < 0 || target >= carousel.items.length) return;
    const items = [...carousel.items]; [items[index], items[target]] = [items[target], items[index]];
    setCarousel((current) => ({ ...current, items: items.map((item, order) => ({ ...item, order })) }));
  };
  const handleUpload = async (file?: File) => {
    if (!file || !selectedItem) return;
    if (!['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) return showToast('Use SVG, PNG, JPG, WEBP ou GIF com até 2 MB.');
    updateItem({ image: { source: 'upload', value: URL.createObjectURL(file), alt: selectedItem.name } });
    try { const result = await uploadImage(file); updateItem({ image: { source: 'upload', value: result.url, alt: selectedItem.name } }); showToast('Imagem enviada com sucesso.'); } catch { showToast('Prévia local aplicada. Conecte a API para concluir o upload.'); }
  };
  const handleSave = async () => {
    setSaving(true);
    try { const saved = await saveCarousel(carousel); setCarousel(saved); setConnected(true); showToast('Alterações publicadas com sucesso.'); }
    catch { localStorage.setItem('marketbreja-carousel', JSON.stringify(carousel)); setConnected(false); showToast('Rascunho salvo localmente.'); }
    finally { setSaving(false); }
  };

  return <div className="app-shell carousel-page">
    <ManagerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <main>
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button><div className="crumb"><span>Personalização</span><ChevronRight size={14} /><strong>Carrossel de navegação</strong></div><div className="top-actions"><button><Search size={19} /></button><button><Bell size={19} /><i /></button><div className="header-avatar">AM</div></div></header>
      <div className="content">
        <div className="page-heading"><div><a className="c-back" href="#/pedidos"><ArrowLeft size={17} /></a><div><div className={`eyebrow ${connected ? '' : 'offline'}`}><span className="live-dot" />{connected ? 'API CONECTADA' : 'MODO LOCAL'}</div><h1>Carrossel de navegação</h1><p>Crie atalhos visuais para ajudar seus clientes a encontrarem o que procuram.</p></div></div><div className="heading-actions"><button className="btn secondary"><Eye size={17} /> Visualizar loja</button><button className="btn primary" onClick={handleSave} disabled={saving}><Save size={17} />{saving ? 'Salvando...' : 'Salvar alterações'}</button></div></div>
        <div className="c-workspace">
          <section className="c-editor">
            <div className="c-tabs">{([['general', Settings, 'Geral'], ['items', LayoutGrid, 'Itens'], ['appearance', Palette, 'Aparência'], ['responsive', Smartphone, 'Responsivo']] as const).map(([id, Icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={16} />{label}{id === 'items' && <span>{carousel.items.length}</span>}</button>)}</div>
            <div className="c-editor-content">
              {tab === 'general' && <div className="c-form"><div className="c-section-title"><div><h2>Informações gerais</h2><p>Identificação e visibilidade do componente.</p></div></div><div className="c-grid-two"><Field label="Nome interno" hint="Visível somente para a sua equipe."><input value={carousel.internalName} onChange={(event) => update('internalName', event.target.value)} /></Field><Field label="Identificador (slug)"><input value={carousel.slug} onChange={(event) => update('slug', event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))} /></Field></div><Field label="Título exibido na loja"><input value={carousel.title} onChange={(event) => update('title', event.target.value)} /></Field><div className="c-setting"><div><strong>Exibir título</strong><span>Mostra o título acima dos itens.</span></div><Toggle checked={carousel.showTitle} onChange={(value) => update('showTitle', value)} /></div><div className="c-setting"><div><strong>Componente ativo</strong><span>Quando inativo, não aparece na loja publicada.</span></div><Toggle checked={carousel.active} onChange={(value) => update('active', value)} /></div></div>}
              {tab === 'items' && <div className="c-items-layout"><div className="c-items-pane"><div className="c-section-title"><div><h2>Itens do carrossel</h2><p>Selecione um item para editar.</p></div><button className="c-icon-button" onClick={addItem}><Plus size={17} /></button></div><div className="c-items-list">{carousel.items.map((item) => { const Icon = iconLibrary[item.image.value] ?? ImagePlus; return <button key={item.id} className={item.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(item.id)}><span className="c-thumb">{item.image.source === 'upload' ? <img src={item.image.value} alt="" /> : <Icon size={19} />}</span><span><strong>{item.name}</strong><small>{destinationLabels[item.destination.type]} · {item.destination.label || item.destination.value}</small></span><i className={item.active ? 'active' : ''} /></button>; })}</div><button className="c-add" onClick={addItem}><Plus size={15} /> Adicionar novo item</button></div><div className="c-item-form">{selectedItem ? <><div className="c-item-head"><div><span>EDITANDO ITEM</span><strong>{selectedItem.name}</strong></div><div><button onClick={() => moveItem(-1)} title="Mover para cima"><ArrowUp size={15} /></button><button onClick={() => moveItem(1)} title="Mover para baixo"><ArrowDown size={15} /></button><button className="danger" onClick={removeItem} title="Remover"><Trash2 size={15} /></button></div></div><Field label="Nome do item"><input value={selectedItem.name} onChange={(event) => updateItem({ name: event.target.value, image: { ...selectedItem.image, alt: event.target.value } })} /></Field><div className="c-mini-title">IMAGEM OU ÍCONE</div><div className="c-source-tabs"><button className={selectedItem.image.source === 'icon' ? 'active' : ''} onClick={() => updateItem({ image: { source: 'icon', value: 'Beer', alt: selectedItem.name } })}><Sparkles size={14} /> Biblioteca</button><button className={selectedItem.image.source === 'upload' ? 'active' : ''} onClick={() => fileInput.current?.click()}><Upload size={14} /> Upload</button></div>{selectedItem.image.source === 'icon' ? <div className="c-icon-library">{Object.entries(iconLibrary).map(([name, Icon]) => <button key={name} className={selectedItem.image.value === name ? 'active' : ''} onClick={() => updateItem({ image: { source: 'icon', value: name, alt: selectedItem.name } })}><Icon size={19} /></button>)}</div> : <button className="c-upload-preview" onClick={() => fileInput.current?.click()}><img src={selectedItem.image.value} alt={selectedItem.image.alt} /><span><Upload size={13} /> Trocar imagem</span></button>}<input ref={fileInput} className="c-hidden" type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void handleUpload(event.target.files?.[0])} /><div className="c-grid-two"><Field label="Tipo de destino"><select value={selectedItem.destination.type} onChange={(event) => updateDestination({ type: event.target.value as DestinationType, value: '', label: '' })}>{Object.entries(destinationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Destino">{selectedItem.destination.type === 'external_url' || selectedItem.destination.type === 'search' ? <input placeholder={selectedItem.destination.type === 'external_url' ? 'https://...' : 'Termo de busca'} value={selectedItem.destination.value} onChange={(event) => updateDestination({ value: event.target.value, label: event.target.value })} /> : <select value={selectedItem.destination.value} onChange={(event) => updateDestination({ value: event.target.value, label: event.target.value })}><option value="">Selecione</option>{destinationOptions[selectedItem.destination.type].map((value) => <option key={value}>{value}</option>)}</select>}</Field></div><div className="c-setting"><div><strong>Item ativo</strong><span>Controla a exibição deste atalho.</span></div><Toggle checked={selectedItem.active} onChange={(active) => updateItem({ active })} /></div></> : <div className="c-empty">Adicione um item para começar.</div>}</div></div>}
              {tab === 'appearance' && <div className="c-form"><div className="c-section-title"><div><h2>Aparência</h2><p>Cores, bordas e efeitos do carrossel.</p></div></div><div className="c-grid-two"><Field label="Fundo da seção"><div className="c-color"><input type="color" value={carousel.sectionBackground} onChange={(event) => update('sectionBackground', event.target.value)} /><span>{carousel.sectionBackground}</span></div></Field><Field label="Fundo dos itens"><div className="c-color"><input type="color" value={carousel.style.backgroundColor} onChange={(event) => updateStyle('backgroundColor', event.target.value)} /><span>{carousel.style.backgroundColor}</span></div></Field><Field label="Cor do texto"><div className="c-color"><input type="color" value={carousel.style.textColor} onChange={(event) => updateStyle('textColor', event.target.value)} /><span>{carousel.style.textColor}</span></div></Field><Field label="Cor da borda"><div className="c-color"><input type="color" value={carousel.style.borderColor} onChange={(event) => updateStyle('borderColor', event.target.value)} /><span>{carousel.style.borderColor}</span></div></Field><Field label={`Espessura da borda · ${carousel.style.borderWidth}px`}><input type="range" min="0" max="6" value={carousel.style.borderWidth} onChange={(event) => updateStyle('borderWidth', Number(event.target.value))} /></Field><Field label={`Arredondamento · ${carousel.style.borderRadius}px`}><input type="range" min="0" max="50" value={carousel.style.borderRadius} onChange={(event) => updateStyle('borderRadius', Number(event.target.value))} /></Field><Field label="Sombra"><select value={carousel.style.shadow} onChange={(event) => updateStyle('shadow', event.target.value as NavigationCarousel['style']['shadow'])}><option value="none">Nenhuma</option><option value="soft">Suave</option><option value="medium">Média</option><option value="strong">Forte</option></select></Field><Field label="Efeito ao passar o mouse"><select value={carousel.style.hoverEffect} onChange={(event) => updateStyle('hoverEffect', event.target.value as NavigationCarousel['style']['hoverEffect'])}><option value="none">Nenhum</option><option value="lift">Elevar</option><option value="glow">Brilho</option><option value="border">Borda</option></select></Field></div></div>}
              {tab === 'responsive' && <div className="c-form"><div className="c-section-title"><div><h2>Comportamento responsivo</h2><p>Ajuste a apresentação em cada dispositivo.</p></div></div><div className="c-device-card"><div><Monitor size={18} /><strong>Desktop</strong></div><div className="c-grid-two"><Field label={`Itens visíveis · ${carousel.responsive.desktopItems}`}><input type="range" min="2" max="8" value={carousel.responsive.desktopItems} onChange={(event) => updateResponsive('desktopItems', Number(event.target.value))} /></Field><Field label="Setas de navegação"><select value={carousel.responsive.desktopArrows} onChange={(event) => updateResponsive('desktopArrows', event.target.value as NavigationCarousel['responsive']['desktopArrows'])}><option value="always">Sempre</option><option value="hover">Ao passar o mouse</option><option value="never">Nunca</option></select></Field></div></div><div className="c-device-card"><div><Smartphone size={18} /><strong>Mobile</strong></div><div className="c-grid-two"><Field label={`Itens visíveis · ${carousel.responsive.mobileItems}`}><input type="range" min="1" max="4" value={carousel.responsive.mobileItems} onChange={(event) => updateResponsive('mobileItems', Number(event.target.value))} /></Field><Field label="Formato"><select value={carousel.responsive.itemShape} onChange={(event) => updateResponsive('itemShape', event.target.value as NavigationCarousel['responsive']['itemShape'])}><option value="circle">Circular</option><option value="square">Quadrado</option><option value="rectangle">Retangular</option></select></Field></div><div className="c-setting"><div><strong>Encaixe ao rolar</strong><span>Alinha cada item durante o gesto.</span></div><Toggle checked={carousel.responsive.mobileSnap} onChange={(value) => updateResponsive('mobileSnap', value)} /></div></div><Field label={`Espaçamento entre itens · ${carousel.responsive.gap}px`}><input type="range" min="0" max="40" value={carousel.responsive.gap} onChange={(event) => updateResponsive('gap', Number(event.target.value))} /></Field></div>}
            </div>
          </section>
          <section className="c-preview-panel"><div className="c-preview-toolbar"><div><strong>Pré-visualização</strong><span>Atualizada em tempo real</span></div><div><button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')}><Monitor size={16} /></button><button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')}><Smartphone size={16} /></button></div></div><div className="c-preview-stage"><Preview carousel={carousel} viewport={viewport} /></div><div className="c-preview-note"><Check size={15} /> As alterações aparecem na loja depois de salvar.</div></section>
        </div>
      </div>
    </main>
    {toast && <div className="toast"><Check size={17} /><span>{toast}</span></div>}
  </div>;
}
