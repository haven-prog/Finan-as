// ─── CONSTANTS ───────────────────────────────────────────────
const NOW = new Date()
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
export const MES_ATUAL    = cap(NOW.toLocaleString('pt-BR', { month: 'long' }))
export const MES_ANTERIOR = cap(new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1).toLocaleString('pt-BR', { month: 'long' }))
export const MES_2_ATRAS  = cap(new Date(NOW.getFullYear(), NOW.getMonth() - 2, 1).toLocaleString('pt-BR', { month: 'long' }))
export const DAYS_IN_MONTH = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0).getDate()
export const DAYS_LEFT = DAYS_IN_MONTH - NOW.getDate() + 1

export const CATS_OUT = [
  { id: 'essen',  l: 'Essenciais',  e: '🏠' },
  { id: 'food',   l: 'Alimentação', e: '🍔' },
  { id: 'life',   l: 'Lazer',       e: '🎮' },
  { id: 'saude',  l: 'Saúde',       e: '💊' },
  { id: 'transp', l: 'Transporte',  e: '🚌' },
  { id: 'outros', l: 'Outros',      e: '📦' },
]
export const CATS_IN = [
  { id: 'sal',   l: 'Salário',    e: '💰' },
  { id: 'free',  l: 'Freelance',  e: '💵' },
  { id: 'bonus', l: 'Bônus',      e: '🎁' },
  { id: 'inv',   l: 'Rendimento', e: '📈' },
  { id: 'outro', l: 'Outro',      e: '💫' },
]

export const EMOJIS = ['✈️','🚗','🏠','🎓','💻','🎮','🌍','🏖️','💍','🐾','🎸','📱','🏋️','🍕','🎁','💎','🚀','🌱']
export const GF_ICONS = ['🏠','💧','⚡','📡','🏋️','📺','🚗','🐾','💊','🎓','🛡','📱','🧹','🔥','🌡','🛒','🔐','🏦']

// Auto-categorization keyword map
export const AUTO_CAT = {
  uber:         'transp', lyft: 'transp', taxi: 'transp', ônibus: 'transp', metrô: 'transp',
  ifood:        'food',  rappi: 'food',   'zé delivery': 'food', mercado: 'food',
  supermercado: 'food',  carrefour: 'food', extra: 'food', atacadão: 'food',
  netflix:      'life',  spotify: 'life', disney: 'life',  prime: 'life',
  hbo:          'life',  cinema: 'life',  teatro: 'life',  show: 'life',
  academia:     'saude', farmácia: 'saude', remédio: 'saude', médico: 'saude',
  hospital:     'saude', plano: 'saude',
  aluguel:      'essen', água: 'essen',   luz: 'essen', internet: 'essen',
  condomínio:   'essen', seguro: 'essen', iptu: 'essen',
}

// Celebration reactions
export const REACTIONS = ['🎉', '❤️', '🏆', '💪', '🔥', '👏']

// ─── INITIAL DATA ─────────────────────────────────────────────
export const INIT_TXS = [
  { id: 1,  name: 'Salário Gabriel', cat: 'Salário',    icon: '💰', amount:  8500,    owner: 'Gabriel', date: '01/03', type: 'in',  gfId: null },
  { id: 2,  name: 'Salário Gabi',    cat: 'Salário',    icon: '💰', amount:  6200,    owner: 'Gabi',    date: '01/03', type: 'in',  gfId: null },
  { id: 3,  name: 'Aluguel',         cat: 'Essenciais', icon: '🏠', amount: -1800,    owner: 'Ambos',   date: '05/03', type: 'out', gfId: 1 },
  { id: 4,  name: 'Netflix',         cat: 'Lazer',      icon: '📺', amount: -55.90,   owner: 'Ambos',   date: '05/03', type: 'out', gfId: 6 },
  { id: 5,  name: 'iFood',           cat: 'Alimentação',icon: '🛵', amount: -89.90,   owner: 'Gabriel', date: '10/03', type: 'out', gfId: null },
  { id: 6,  name: 'Academia',        cat: 'Saúde',      icon: '🏋️', amount: -99.90,   owner: 'Gabriel', date: '10/03', type: 'out', gfId: 5 },
  { id: 7,  name: 'Supermercado',    cat: 'Alimentação',icon: '🛒', amount: -287.50,  owner: 'Gabi',    date: '12/03', type: 'out', gfId: null },
  { id: 8,  name: 'Freela Gabi',     cat: 'Freelance',  icon: '💵', amount:  1200,    owner: 'Gabi',    date: '15/03', type: 'in',  gfId: null },
  { id: 9,  name: 'Conta de Água',   cat: 'Essenciais', icon: '💧', amount: -98.50,   owner: 'Ambos',   date: '08/03', type: 'out', gfId: 2 },
  { id: 10, name: 'Conta de Luz',    cat: 'Essenciais', icon: '⚡', amount: -187.30,  owner: 'Gabriel', date: '09/03', type: 'out', gfId: 3 },
  { id: 11, name: 'Parcela Casa',    cat: 'Essenciais', icon: '🏡', amount: -1200,    owner: 'Ambos',   date: '01/03', type: 'out', gfId: 7 },
]

export const INIT_GOALS = [
  {
    id: 1, name: 'Viagem Europa', emoji: '✈️', target: 15000, current: 4200,
    deadline: 'Dez 2025', monthly: 1100, isParcela: false, parcelaValor: 0,
    parcelasTotal: 0, parcelasPagas: 0, linkedGfId: null,
    contribs: [
      { id: 1, label: 'Aporte inicial', amount: 2000, date: '01/01', owner: 'Ambos' },
      { id: 2, label: 'Bônus Gabriel',  amount: 1500, date: '15/02', owner: 'Gabriel' },
      { id: 3, label: 'Freela Gabi',    amount:  700, date: '03/03', owner: 'Gabi' },
    ],
  },
  {
    id: 2, name: 'Casa Própria', emoji: '🏡', target: 144000, current: 3600,
    deadline: 'Dez 2034', monthly: 1200, isParcela: true, parcelaValor: 1200,
    parcelasTotal: 120, parcelasPagas: 3, linkedGfId: 7,
    contribs: [
      { id: 1, label: 'Parcela 1/120', amount: 1200, date: '01/01', owner: 'Ambos' },
      { id: 2, label: 'Parcela 2/120', amount: 1200, date: '01/02', owner: 'Ambos' },
      { id: 3, label: 'Parcela 3/120', amount: 1200, date: '01/03', owner: 'Ambos' },
    ],
  },
  {
    id: 3, name: 'Intercâmbio Gabi', emoji: '🌍', target: 8000, current: 2400,
    deadline: 'Mar 2026', monthly: 600, isParcela: false, parcelaValor: 0,
    parcelasTotal: 0, parcelasPagas: 0, linkedGfId: null,
    contribs: [
      { id: 1, label: 'Início meta',   amount: 1200, date: '15/01', owner: 'Gabi' },
      { id: 2, label: 'Presente aniv', amount: 1200, date: '10/02', owner: 'Ambos' },
    ],
  },
]

export const INIT_GF = [
  { id: 1, name: 'Aluguel',     icon: '🏠', color: '#60a5fa', bg: 'rgba(96,165,250,.1)',  owner: 'Ambos',   limit: 1800, recorrente: true,  goalId: null },
  { id: 2, name: 'Água',        icon: '💧', color: '#38bdf8', bg: 'rgba(56,189,248,.1)',  owner: 'Ambos',   limit: 120,  recorrente: true,  goalId: null },
  { id: 3, name: 'Luz',         icon: '⚡', color: '#fbbf24', bg: 'rgba(251,191,36,.1)',  owner: 'Ambos',   limit: 200,  recorrente: true,  goalId: null },
  { id: 4, name: 'Internet',    icon: '📡', color: '#a78bfa', bg: 'rgba(167,139,250,.1)', owner: 'Ambos',   limit: 150,  recorrente: true,  goalId: null },
  { id: 5, name: 'Academia',    icon: '🏋️', color: '#4ade80', bg: 'rgba(74,222,128,.1)',  owner: 'Gabriel', limit: 100,  recorrente: true,  goalId: null },
  { id: 6, name: 'Assinaturas', icon: '📺', color: '#f472b6', bg: 'rgba(244,114,182,.1)', owner: 'Ambos',   limit: 180,  recorrente: true,  goalId: null },
  { id: 7, name: 'Parcela Casa',icon: '🏡', color: '#fb923c', bg: 'rgba(251,146,60,.1)',  owner: 'Ambos',   limit: 1200, recorrente: true,  goalId: 2 },
]

export const INIT_EMERGENCY = { current: 12900, target: 30000 }
export const INIT_FREE      = { limit: 1000 }  // unified (both people combined)
