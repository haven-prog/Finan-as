# Tutorial Casal Finance — v7 🚀
**Arquitetura Modular + Todas as Novas Features**

---

## 1. Estrutura de Arquivos

```
casal-finance/
├── package.json          ← dependências do projeto
├── vite.config.js        ← build config
├── index.html            ← entry HTML
└── src/
    ├── main.jsx          ← monta o React no DOM (importa index.css)
    ├── App.jsx           ← roteador fino + orquestração de modais
    ├── index.css         ← TODO o CSS (tokens + componentes)
    ├── constants.js      ← dados iniciais, categorias, emojis, AUTO_CAT
    ├── utils.js          ← fmt (Intl), hoje(), autoCat(), pctColor()
    ├── context/
    │   └── FinanceContext.jsx  ← estado global + localStorage + computed
    └── components/
        ├── ui/
        │   ├── ScoreRing.jsx   ← ring de pontuação
        │   ├── TxRow.jsx       ← linha de transação com swipe
        │   └── BottomNav.jsx   ← navegação inferior
        ├── modals/
        │   ├── TxModal.jsx     ← lançamento (+ auto-cat + vínculo GF)
        │   ├── GFModal.jsx     ← criar/editar gasto fixo (+ vincular meta)
        │   ├── GoalModal.jsx   ← criar/editar meta (+ modo parcelas)
        │   ├── ContribModal.jsx← aporte em meta
        │   ├── RealidadeModal.jsx ← conciliação bancária
        │   ├── CelebModal.jsx  ← notificação de cumplicidade
        │   ├── EmergencyModal.jsx
        │   ├── FreeModal.jsx   ← limite único do casal
        │   ├── SimModal.jsx    ← modo "E Se?"
        │   └── Confirm.jsx     ← confirmação de exclusão
        └── pages/
            ├── HomePage.jsx
            ├── GastosFixosPage.jsx
            ├── MetasPage.jsx
            ├── GastosPage.jsx
            └── IntelPage.jsx
```

---

## 2. Instalação — Passo a Passo

```bash
# 1. Extraia o ZIP numa pasta (substitua a pasta src/ inteira)
unzip casal-finance-v7.zip -d /sua/pasta/

# 2. Copie os arquivos para o projeto
cp -r v7/* /caminho/do/seu/projeto/

# 3. Instale as dependências (se ainda não instalou)
cd /caminho/do/seu/projeto
npm install

# 4. Teste no navegador
npm run dev
# Acesse http://localhost:3000

# 5. Build para Android
npm run build
npx cap sync
npx cap open android
# ▶ Run no Android Studio
```

---

## 3. Novas Features — Como Usar

---

### 3.1 Parcelas Integradas com Metas 🏦

**Criar uma meta de financiamento/parcelas:**
1. Aba **Metas** → botão **＋ Nova Meta**
2. Ative o toggle **🏦 Financiamento / Parcelas**
3. Preencha: **Valor da parcela** (ex: R$1.200) e **Número de parcelas** (ex: 120)
4. O total é calculado automaticamente (R$144.000)
5. Salve

**Vincular ao Gasto Fixo:**
1. Aba **Fixos** → expanda um card → botão **✏️ Editar** (ou crie novo)
2. Na seção **🎯 Vincular a uma Meta?**, toque na meta de parcelas
3. Salve

**Resultado automático:** A partir de agora, toda vez que você lançar um pagamento
no Gasto Fixo vinculado, o app conta uma parcela automaticamente na meta.
O contador "Parcela X/120" e o progresso avançam sozinhos.

A MetasPage mostra o valor comprometido nos próximos meses:
```
Comprometido: R$140.400    Já pago: R$3.600
```

---

### 3.2 Gasto Livre Unificado 👫

**Como funciona:** O antigo sistema de dois limites separados (Gabriel / Gabi)
foi substituído por um limite único do casal. A tela inicial mostra um único card
com o total gasto em Lazer vs o limite combinado.

**Editar o limite:**
1. Tela **Início** → na seção "Gasto Livre do Casal" → toque em **✏️ Editar**
2. Ajuste o valor com os botões +/− ou use os atalhos (R$500, R$700, R$1.000...)
3. Salve

---

### 3.3 Modo Realidade ⚖️

**Quando usar:** Quando perceber que o app está mostrando um saldo diferente
do que o banco mostra (esqueceram de lançar algo, taxa bancária, etc.)

**Como usar:**
1. Tela **Início** → botão **⚖️ Modo Realidade**
2. O app mostra o saldo calculado: ex. "App diz: R$1.850"
3. Digite o valor que o seu banco mostra: ex. R$1.650
4. O app calcula a diferença: −R$200
5. Toque em **Criar Ajuste de Saída (−R$200)**
6. Um lançamento "Ajuste de Conciliação ⚖️" é criado automaticamente

> Isso resolve sem apagar ou mexer nos lançamentos existentes.

---

### 3.4 Notificação de Cumplicidade 🎉

**Como funciona:** Quando um aporte manual ou um pagamento de parcela faz
uma meta atingir 25%, 50%, 75% ou 100%, uma tela de celebração aparece
automaticamente.

**O que fazer:**
1. A tela aparece com o emoji da meta e o percentual atingido
2. Escolha uma reação (🎉 ❤️ 🏆 💪 🔥 👏)
3. Toque em **Enviar para [parceiro(a)]!**
4. A notificação fica marcada como lida

> O ícone 🏠 na nav mostra um badge vermelho quando há celebrações pendentes.

---

### 3.5 Swipe nas Transações (Gestos Nativos) ←→

**Na aba Gastos (Lançamentos):**
- **Deslize para a esquerda** → apaga a transação (revelação vermelha 🗑️)
- **Deslize para a direita** → abre para editar (revelação azul ✏️)
- **Duplo toque** → também abre para editar

> O threshold é 70px — precisa de um swipe decidido, não vai disparar por acidente.

---

### 3.6 Auto-Categorização ✨

**No modal de lançamento, ao digitar a descrição:**

| Você digita... | App detecta... |
|---------------|----------------|
| "Uber" | 🚌 Transporte |
| "iFood" | 🍔 Alimentação |
| "Netflix" | 🎮 Lazer |
| "Farmácia" | 💊 Saúde |
| "Academia" | 💊 Saúde |
| "Aluguel" | 🏠 Essenciais |
| "Supermercado" | 🍔 Alimentação |

Aparece a mensagem **✨ Categoria detectada automaticamente** em âmbar.
Você pode ignorar e escolher outra categoria manualmente.

**Para adicionar novos termos:** Edite `src/constants.js`, objeto `AUTO_CAT`:
```js
export const AUTO_CAT = {
  'seu-termo': 'id-da-categoria', // transp|food|life|saude|essen|outros
  ...
}
```

---

## 4. Arquitetura — Como Funciona

---

### 4.1 Context API (Estado Global)

O `FinanceContext.jsx` é o coração do app. Ele usa `useReducer` para gerenciar
todo o estado e `useMemo` para calcular valores derivados sem recalcular à toa.

```jsx
// Em qualquer componente, basta:
import { useFinance } from '../../context/FinanceContext.jsx'

function MeuComponente() {
  const { txs, goals, gfs, saldo, totals, gfData, dispatch } = useFinance()
  // ...
}
```

**Valores disponíveis no contexto:**
- `txs` — todas as transações
- `goals` — todas as metas
- `gfs` — gastos fixos
- `emergency` — reserva de emergência
- `free` — limite unificado de gasto livre
- `notifs` — notificações de celebração
- `saldo` — calculado automaticamente (**useMemo**)
- `totals` — {ent, sai, saldo, guard} (**useMemo**)
- `gfData` — gastos por GF com split por pessoa (**useMemo**)
- `lazerTotal` — total de lazer do casal (**useMemo**)
- `unreadCount` — notificações não lidas (**useMemo**)
- `dispatch` — função para disparar ações

---

### 4.2 Ações do Reducer

```js
// Adicionar transação (com lógica de parcelas automática!)
dispatch({ type: 'ADD_TX', tx: { id, name, cat, icon, amount, owner, date, type, gfId } })

// Editar transação existente
dispatch({ type: 'EDIT_TX', tx: { ...txCompleto } })

// Deletar transação
dispatch({ type: 'DELETE_TX', id: 42 })

// Atualizar lista de metas
dispatch({ type: 'SET_GOALS', goals: [...] })

// Adicionar aporte a uma meta
dispatch({ type: 'ADD_CONTRIB', goalId: 1, contrib: { id, label, amount, date, owner }, tx: txOpcional })

// Deletar aporte de uma meta
dispatch({ type: 'DEL_CONTRIB', goalId: 1, ctId: 3 })

// Atualizar gastos fixos
dispatch({ type: 'SET_GFS', gfs: [...] })

// Editar reserva de emergência
dispatch({ type: 'SET_EMERGENCY', emergency: { current: 15000, target: 30000 } })

// Editar limite de gasto livre
dispatch({ type: 'SET_FREE', free: { limit: 1200 } })

// Marcar notificação como lida (+ reação)
dispatch({ type: 'READ_NOTIF', id: notif.id, reaction: '🎉' })

// Criar transação de conciliação
dispatch({ type: 'RECONCILE', amount: -200 }) // positivo = entrada, negativo = saída
```

---

### 4.3 LocalStorage (Persistência Automática)

Os dados são salvos automaticamente no localStorage a cada mudança de estado:

```js
// Chave de armazenamento:
'casal-finance-v7'

// Para resetar o app (apagar todos os dados):
localStorage.removeItem('casal-finance-v7')
// e recarregue a página
```

> **Importante:** O localStorage é por dispositivo. Cada celular tem seus
> próprios dados. Para sincronização entre dispositivos, o próximo passo
> seria integrar com Supabase ou Firebase.

---

### 4.4 Intl.NumberFormat (Formatação Correta)

A função `fmt` em `utils.js` usa a API nativa do navegador:

```js
// Em utils.js:
export const fmt = n =>
  'R$' + new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(n))

// Resultado: 'R$1.800', 'R$12.450', etc.
```

---

## 5. Adicionando Novas Features

---

### Adicionar nova categoria de transação

Em `src/constants.js`:
```js
export const CATS_OUT = [
  // ... existentes
  { id: 'pet', l: 'Pet Shop', e: '🐾' },
]
```

---

### Adicionar nova keyword de auto-categorização

Em `src/constants.js`:
```js
export const AUTO_CAT = {
  // ... existentes
  'petshop': 'saude',   // mapeia para Saúde
  'banho':   'saude',
  'streaming': 'life',  // mapeia para Lazer
}
```

---

### Adicionar novo Gasto Fixo via código

Em `src/constants.js`, no array `INIT_GF`:
```js
{
  id: 8,
  name: 'Plano de Saúde',
  icon: '🏥',
  color: '#4ade80',
  bg: 'rgba(74,222,128,.1)',
  owner: 'Ambos',
  limit: 450,
  recorrente: true,
  goalId: null,         // null = sem meta vinculada
},
```

> **Atenção:** Modificar `INIT_GF` só afeta novos usuários (sem dados no
> localStorage). Para usuários existentes, adicione pelo botão ＋ na aba Fixos.

---

### Conectar Supabase (próxima evolução)

1. `npm install @supabase/supabase-js`
2. Crie `src/lib/supabase.js` com suas credenciais
3. Em `FinanceContext.jsx`, troque o `localStorage` por chamadas Supabase
4. Use `realtime` subscriptions para sincronizar entre dispositivos

```js
// Exemplo de substituição no useEffect:
useEffect(() => {
  supabase.from('transactions').upsert(state.txs)
}, [state.txs])
```

---

## 6. Dicas de Uso Diário

| Situação | O que fazer |
|----------|-------------|
| Pagou a conta de luz | Aba Fixos → Luz → Lançar (já vincula automaticamente) |
| Gastou no iFood | FAB ＋ → Saída → digita "iFood" (auto-detecta Alimentação) |
| Recebeu salário | Início → ⬆️ Entrada |
| Saldo do app diferente do banco | Início → ⚖️ Modo Realidade → ajusta |
| Parcela do financiamento | Fixos → Parcela Casa → Lançar (conta na meta automático) |
| Meta atingiu 50% | Popup aparece → escolha reação → envie para parceiro(a) |
| Quer ver onde mais gasta | Aba 🧠 IA → Top Categorias |
| Compra parcelada grande | Metas → Nova Meta → ativa Financiamento → cria Gasto Fixo e vincula |

---

## 7. Checklist do Projeto

- [x] Arquitetura modular (src/components + context)
- [x] CSS fora do JS (index.css com design tokens)
- [x] Context API (sem prop drilling)
- [x] useMemo nos cálculos pesados
- [x] LocalStorage (dados não somem ao fechar)
- [x] Intl.NumberFormat (formatação robusta)
- [x] Swipe gestures (delete ← e edit →)
- [x] Auto-categorização por keyword
- [x] Modo Realidade (conciliação bancária)
- [x] Parcelas integradas com Metas
- [x] Gasto Livre unificado
- [x] Notificações de Cumplicidade
- [ ] Supabase/Firebase (próxima evolução)
- [ ] Push notifications reais (via Capacitor)
- [ ] Backup na nuvem
