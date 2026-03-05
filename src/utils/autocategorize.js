// ─── Auto-Categorization Engine ──────────────────────────────
// Maps keywords in description → category name
// Learns from past transactions (frequency map)

const KEYWORD_RULES = [
  { cat: 'Transporte',  keys: ['uber','99','lyft','taxi','onibus','metro','combustivel','gasolina','gasolina','etanol','estacionamento','pedagio','brt','metrô','trem','passagem'] },
  { cat: 'Alimentação', keys: ['ifood','rappi','ubereats','restaurante','hamburguer','hamburger','pizza','lanche','cafe','cafeteria','padaria','sushi','temaki','acai','sorvete','lanches','mcdonalds','burguer','burguerking','subway','coxinha'] },
  { cat: 'Lazer',       keys: ['netflix','spotify','amazon','prime','disney','hbo','youtube','deezer','crunchyroll','cinema','teatro','show','ingresso','jogo','bar','balada','festa','viagem'] },
  { cat: 'Saúde',       keys: ['farmacia','drogaria','remedio','medico','consulta','exame','dentista','academia','gym','pilates','yoga','saude','plano de saude','unimed','hapvida','sulamerica'] },
  { cat: 'Essenciais',  keys: ['mercado','supermercado','hortifruti','feira','atacadao','carrefour','extra','pao de acucar','walmart','cia','aluguel','condominio','iptu','agua','luz','energia','gas','internet','telefone','tim','vivo','claro','oi'] },
  { cat: 'Salário',     keys: ['salario','salário','pagamento','holerite','proventos'] },
  { cat: 'Freelance',   keys: ['freela','freelance','projeto','consultoria','servico','autonomo'] },
  { cat: 'Investimento',keys: ['investimento','aporte','poupanca','tesouro','cdb','fii','acoes','cripto'] },
]

/**
 * Suggest a category from description string.
 * Returns category name string or null.
 */
export const autoCateg = (desc) => {
  if (!desc || typeof desc !== 'string') return null
  const lower = desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const rule of KEYWORD_RULES) {
    if (rule.keys.some(k => lower.includes(k))) return rule.cat
  }
  return null
}

/**
 * Returns CATS_OUT id from category name
 */
export const catNameToId = (name, catsOut) => {
  const found = catsOut.find(c => c.l === name)
  return found ? found.id : null
}
