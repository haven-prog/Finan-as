// ─── Initial Seed Data ───────────────────────────────────────
// Used only when localStorage is empty (first run)

export const INIT_TXS = [
  { id:1,  name:'Salário Gabriel', cat:'Salário',    icon:'💰', amount:8500,    owner:'Gabriel', date:'01/03', type:'in',  gfId:null },
  { id:2,  name:'Salário Gabi',    cat:'Salário',    icon:'💰', amount:6200,    owner:'Gabi',    date:'01/03', type:'in',  gfId:null },
  { id:3,  name:'Aluguel',         cat:'Essenciais', icon:'🏠', amount:-1800,   owner:'Ambos',   date:'05/03', type:'out', gfId:1   },
  { id:4,  name:'Netflix',         cat:'Lazer',      icon:'📺', amount:-55.90,  owner:'Ambos',   date:'Auto',  type:'out', gfId:6   },
  { id:5,  name:'iFood',           cat:'Alimentação',icon:'🛵', amount:-89.90,  owner:'Gabriel', date:'10/03', type:'out', gfId:null },
  { id:6,  name:'Academia',        cat:'Saúde',      icon:'🏋️', amount:-99.90,  owner:'Gabriel', date:'Auto',  type:'out', gfId:5   },
  { id:7,  name:'Supermercado',    cat:'Essenciais', icon:'🛒', amount:-287.50, owner:'Gabi',    date:'12/03', type:'out', gfId:null },
  { id:8,  name:'Freela Gabi',     cat:'Freelance',  icon:'💵', amount:1200,    owner:'Gabi',    date:'15/03', type:'in',  gfId:null },
  { id:9,  name:'Conta de Água',   cat:'Essenciais', icon:'💧', amount:-98.50,  owner:'Ambos',   date:'08/03', type:'out', gfId:2   },
  { id:10, name:'Conta de Luz',    cat:'Essenciais', icon:'⚡', amount:-187.30, owner:'Gabriel', date:'09/03', type:'out', gfId:3   },
]

export const INIT_GF = [
  { id:1, name:'Aluguel',      icon:'🏠', color:'#60a5fa', bg:'rgba(96,165,250,.1)',  owner:'Ambos',   limit:1800, recorrente:true,  parcelaConfig:null },
  { id:2, name:'Água',         icon:'💧', color:'#38bdf8', bg:'rgba(56,189,248,.1)',  owner:'Ambos',   limit:120,  recorrente:true,  parcelaConfig:null },
  { id:3, name:'Luz',          icon:'⚡', color:'#fbbf24', bg:'rgba(251,191,36,.1)',  owner:'Ambos',   limit:200,  recorrente:true,  parcelaConfig:null },
  { id:4, name:'Internet',     icon:'📡', color:'#a78bfa', bg:'rgba(167,139,250,.1)', owner:'Ambos',   limit:150,  recorrente:true,  parcelaConfig:null },
  { id:5, name:'Academia',     icon:'🏋️', color:'#4ade80', bg:'rgba(74,222,128,.1)',  owner:'Gabriel', limit:100,  recorrente:true,  parcelaConfig:null },
  { id:6, name:'Assinaturas',  icon:'📺', color:'#f472b6', bg:'rgba(244,114,182,.1)', owner:'Ambos',   limit:180,  recorrente:true,  parcelaConfig:null },
  // Example: Sofá parcelado (linked to meta id:4)
  { id:7, name:'Sofá Parcelado',icon:'🛋️',color:'#fb923c', bg:'rgba(251,146,60,.1)',  owner:'Ambos',   limit:320,  recorrente:true,
    parcelaConfig:{ metaId:4, totalParcelas:10, parcelaAtual:3, valorTotal:3200, nomeFinanciamento:'Sofá Sala' }
  },
]

export const INIT_GOALS = [
  {
    id:1, name:'Viagem Europa', emoji:'✈️', target:15000, current:4200,
    deadline:'Dez 2025', monthly:1100, parcelaGfIds:[],
    contribs:[
      { id:1, label:'Aporte inicial', amount:2000, date:'01/01', owner:'Ambos'  },
      { id:2, label:'Bônus Gabriel',  amount:1500, date:'15/02', owner:'Gabriel'},
      { id:3, label:'Freela Gabi',    amount:700,  date:'03/03', owner:'Gabi'   },
    ],
  },
  {
    id:2, name:'Carro Novo', emoji:'🚗', target:30000, current:8900,
    deadline:'Jun 2026', monthly:1500, parcelaGfIds:[],
    contribs:[
      { id:1, label:'Poupança jan',  amount:5000, date:'01/01', owner:'Ambos'   },
      { id:2, label:'Venda notebook',amount:2400, date:'20/01', owner:'Gabriel' },
      { id:3, label:'Poupança fev',  amount:1500, date:'01/02', owner:'Ambos'   },
    ],
  },
  {
    id:3, name:'Intercâmbio', emoji:'🌍', target:8000, current:2400,
    deadline:'Mar 2026', monthly:600, parcelaGfIds:[],
    contribs:[
      { id:1, label:'Início meta',   amount:1200, date:'15/01', owner:'Gabi'  },
      { id:2, label:'Presente aniv', amount:1200, date:'10/02', owner:'Ambos' },
    ],
  },
  {
    id:4, name:'Sofá Sala', emoji:'🛋️', target:3200, current:960,
    deadline:'Dez 2025', monthly:320, parcelaGfIds:[7], // linked to gf id:7
    contribs:[
      { id:1, label:'Parcela 1', amount:320, date:'05/01', owner:'Ambos' },
      { id:2, label:'Parcela 2', amount:320, date:'05/02', owner:'Ambos' },
      { id:3, label:'Parcela 3', amount:320, date:'05/03', owner:'Ambos' },
    ],
  },
]

export const INIT_EMERGENCY = { current: 12900, target: 30000 }

// Unified free spending pool (both persons share one limit)
export const INIT_FREE = { limit: 1000 }
