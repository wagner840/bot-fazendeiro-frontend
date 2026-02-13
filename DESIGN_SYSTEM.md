# Design System — Bot Fazendeiro

Western/ranch theme for a Brazilian RDR2-style farm management bot.

## Cores (Tailwind)

| Token | Uso |
|-------|-----|
| `leather-*` | Backgrounds, borders, surfaces |
| `gold-*` | Accent, CTAs, highlights |
| `parchment-*` | Text, light surfaces |
| `whiskey-*` | Secondary accent, progress |
| `rust-*` | Danger, errors, destructive |
| `wood-*` | Neutral warm tones |

## Tipografia

| Classe | Fonte | Uso |
|--------|-------|-----|
| `font-display` | Rye | Títulos de landing, hero |
| `font-heading` | Playfair Display | Headers, labels |
| `font-body` | Crimson Pro | Texto corrido |
| `font-mono` | JetBrains Mono | Código, dados |

## Componentes CSS (`index.css`)

| Classe | Descrição |
|--------|-----------|
| `.western-card` | Card principal com textura |
| `.btn-western` | Botão padrão couro |
| `.btn-western-gold` | Botão CTA dourado |
| `.btn-western-danger` | Botão destrutivo |
| `.input-western` | Input com estilo western |
| `.select-western` | Select com seta customizada |
| `.table-western` | Tabela com header dourado |
| `.stamp-*` | Status badges (pending/progress/delivered/cancelled) |
| `.nav-item` | Link de navegação sidebar |
| `.stat-card` | Card de estatística |
| `.divider-western` | Divisor com ornamento ✦ |
| `.progress-western` | Barra de progresso whiskey→gold |
| `.badge-western` | Badge inline |
| `.tabs-western` | Tabs com estilo western |
| `.skeleton` | Loading placeholder |
| `.glass-western` | Efeito glassmorphism |
| `.shimmer` | Animação brilho gold |

## Sombras

| Token | Uso |
|-------|-----|
| `shadow-western` | Cards padrão |
| `shadow-western-lg` | Cards em hover |
| `shadow-western-xl` | CTAs |
| `shadow-gold-glow` | Glow dourado |
| `shadow-inner-dark` | Depressão interna |

## Animações

| Token | Efeito |
|-------|--------|
| `animate-fade-in` | Entrada suave |
| `animate-slide-up` | Slide de baixo |
| `animate-slide-in-right` | Slide da esquerda |
| `animate-pulse-gold` | Pulsação dourada |
| `animate-stamp` | Efeito carimbo |

## Padrões de Uso

```tsx
// Card padrão
<div className="western-card p-6">
  <h2 className="font-heading text-gold-500">Título</h2>
  <p className="font-body text-parchment-200">Conteúdo</p>
</div>

// Botão CTA
<button className="btn-western-gold">Assinar Agora</button>

// Status
<span className="stamp stamp-delivered">Entregue</span>
```
