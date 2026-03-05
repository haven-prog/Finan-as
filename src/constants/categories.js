// ─── Category & Icon Constants ───────────────────────────────

export const CATS_OUT = [
  { id: 'essen',  l: 'Essenciais',  e: '🏠' },
  { id: 'food',   l: 'Alimentação', e: '🍔' },
  { id: 'life',   l: 'Lazer',       e: '🎮' },
  { id: 'saude',  l: 'Saúde',       e: '💊' },
  { id: 'transp', l: 'Transporte',  e: '🚌' },
  { id: 'outros', l: 'Outros',      e: '📦' },
]

export const CATS_IN = [
  { id: 'sal',   l: 'Salário',     e: '💰' },
  { id: 'free',  l: 'Freelance',   e: '💵' },
  { id: 'bonus', l: 'Bônus',       e: '🎁' },
  { id: 'inv',   l: 'Rendimento',  e: '📈' },
  { id: 'outro', l: 'Outro',       e: '💫' },
]

export const GF_ICONS = [
  '🏠','💧','⚡','📡','🏋️','📺','🚗','🐾',
  '💊','🎓','🛡','📱','🧹','🔥','🌡','🛒',
  '🔐','🏦','💳','🎵','✈️','🌐','🏥','🎯',
]

export const META_EMOJIS = [
  '✈️','🚗','🏠','🎓','💻','🎮','🌍','🏖️',
  '💍','🐾','🎸','📱','🏋️','🍕','🎁','💎',
  '🚀','🌱','🛳️','🎭','🎪','🏡','🌺','⭐',
]

// Map CATS_OUT id → label (for reverse lookups)
export const CAT_ID_TO_LABEL = Object.fromEntries(
  [...CATS_OUT, ...CATS_IN].map(c => [c.id, c.l])
)

// Map label → id
export const CAT_LABEL_TO_ID = Object.fromEntries(
  [...CATS_OUT, ...CATS_IN].map(c => [c.l, c.id])
)
