import {
  createContext, useContext, useReducer,
  useEffect, useMemo, useRef, useState, useCallback
} from 'react'
import { INIT_TXS, INIT_GOALS, INIT_GF, INIT_EMERGENCY, INIT_FREE } from '../constants.js'
import { hoje, nextId } from '../utils.js'
import { supabase, SUPABASE_READY } from '../supabaseClient.js'

// ─── Constants ────────────────────────────────────────────────
const TABLE      = 'couple_data'
const STORAGE_KEY = 'casal-finance-v7'
const SYNC_KEY    = 'casal-finance-sync'

export const SYNC_STATUS = {
  OFFLINE:   'offline',
  SYNCING:   'syncing',
  SYNCED:    'synced',
  ERROR:     'error',
  NO_CONFIG: 'no_config',
}

// ─── Initial state ────────────────────────────────────────────
const INITIAL_STATE = {
  txs:       INIT_TXS,
  goals:     INIT_GOALS,
  gfs:       INIT_GF,
  emergency: INIT_EMERGENCY,
  free:      INIT_FREE,
  notifs:    [],
}

// ─── Persistence helpers ──────────────────────────────────────
function loadLocal() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r) } catch (_) {}
  return null
}
function saveLocal(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (_) {}
}
function loadSync() {
  try { const r = localStorage.getItem(SYNC_KEY); if (r) return JSON.parse(r) } catch (_) {}
  return null
}
function saveSync(info) {
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(info)) } catch (_) {}
}

// ─── Reducer ─────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'ADD_TX': {
      const tx = action.tx
      let newGoals = state.goals
      const newNotifs = [...state.notifs]

      // Auto-update parcela goals when paying linked GF
      if (tx.gfId) {
        const gf = state.gfs.find(g => g.id === tx.gfId)
        if (gf?.goalId) {
          const goal = state.goals.find(g => g.id === gf.goalId)
          if (goal?.isParcela) {
            const amount = Math.abs(tx.amount)
            const pagas  = (goal.parcelasPagas || 0) + 1
            newGoals = state.goals.map(g => g.id === goal.id ? {
              ...g, current: g.current + amount, parcelasPagas: pagas,
              contribs: [
                { id: nextId(g.contribs || []), label: `Parcela ${pagas}/${g.parcelasTotal}`, amount, date: tx.date, owner: tx.owner },
                ...(g.contribs || []),
              ],
            } : g)
          }
        }
      }

      // Milestone notifications
      newGoals.forEach(updated => {
        const old = state.goals.find(og => og.id === updated.id)
        if (!old || updated.current === old.current) return
        const oP = old.target > 0 ? Math.floor(old.current / old.target * 100) : 0
        const nP = updated.target > 0 ? Math.floor(updated.current / updated.target * 100) : 0
        ;[25, 50, 75, 100].forEach(m => {
          if (oP < m && nP >= m)
            newNotifs.unshift({ id: Date.now() + Math.random(), type: 'milestone', goalId: updated.id, goalName: updated.name, goalEmoji: updated.emoji, milestone: m, from: tx.owner, date: hoje(), read: false, reaction: null })
        })
      })
      return { ...state, txs: [tx, ...state.txs], goals: newGoals, notifs: newNotifs }
    }

    case 'EDIT_TX':
      return { ...state, txs: state.txs.map(t => t.id === action.tx.id ? action.tx : t) }

    case 'DELETE_TX':
      return { ...state, txs: state.txs.filter(t => t.id !== action.id) }

    case 'SET_GOALS':
      return { ...state, goals: action.goals }

    case 'ADD_CONTRIB': {
      const { goalId, contrib, tx } = action
      const newGoals = state.goals.map(g =>
        g.id !== goalId ? g : { ...g, current: g.current + contrib.amount, contribs: [contrib, ...(g.contribs || [])] }
      )
      const notifs = [...state.notifs]
      const old     = state.goals.find(g => g.id === goalId)
      const updated = newGoals.find(g => g.id === goalId)
      if (old && updated) {
        const oP = Math.floor(old.current / old.target * 100)
        const nP = Math.floor(updated.current / updated.target * 100)
        ;[25, 50, 75, 100].forEach(m => {
          if (oP < m && nP >= m)
            notifs.unshift({ id: Date.now() + Math.random(), type: 'milestone', goalId, goalName: updated.name, goalEmoji: updated.emoji, milestone: m, from: contrib.owner, date: hoje(), read: false, reaction: null })
        })
      }
      return { ...state, goals: newGoals, txs: tx ? [tx, ...state.txs] : state.txs, notifs }
    }

    case 'DEL_CONTRIB': {
      const { goalId, ctId } = action
      return {
        ...state,
        goals: state.goals.map(g => {
          if (g.id !== goalId) return g
          const rem = (g.contribs || []).find(c => c.id === ctId)
          return { ...g, current: Math.max(0, g.current - (rem?.amount || 0)), contribs: g.contribs.filter(c => c.id !== ctId) }
        }),
      }
    }

    case 'SET_GFS':       return { ...state, gfs: action.gfs }
    case 'SET_EMERGENCY': return { ...state, emergency: action.emergency }
    case 'SET_FREE':      return { ...state, free: action.free }

    case 'READ_NOTIF':
      return { ...state, notifs: state.notifs.map(n => n.id === action.id ? { ...n, read: true, reaction: action.reaction || n.reaction } : n) }

    case 'RECONCILE': {
      const adjTx = { id: Date.now(), name: 'Ajuste de Conciliação', cat: action.amount >= 0 ? 'Outro' : 'Essenciais', icon: '⚖️', amount: action.amount, owner: 'Ambos', date: hoje(), type: action.amount >= 0 ? 'in' : 'out', gfId: null, isReconcile: true }
      return { ...state, txs: [adjTx, ...state.txs] }
    }

    // Replace entire state from remote (Supabase sync)
    case 'HYDRATE':
      return { ...INITIAL_STATE, ...action.state, notifs: action.state.notifs || [] }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────
const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [state, dispatch]     = useReducer(reducer, null, () => loadLocal() || INITIAL_STATE)
  const [syncInfo, setSyncInfo]     = useState(() => loadSync())
  const [syncStatus, setSyncStatus] = useState(SUPABASE_READY ? SYNC_STATUS.OFFLINE : SYNC_STATUS.NO_CONFIG)
  const [lastSynced, setLastSynced] = useState(null)

  const pushTimer    = useRef(null)
  const isRemote     = useRef(false)     // true while applying remote update → skip echo
  const channelRef   = useRef(null)
  const syncInfoRef  = useRef(syncInfo)  // stable ref always points to latest syncInfo

  // Keep syncInfoRef in sync with state
  useEffect(() => { syncInfoRef.current = syncInfo }, [syncInfo])

  // ── 1. Save to localStorage + debounced push to Supabase ────
  useEffect(() => {
    saveLocal(state)

    if (!SUPABASE_READY || !syncInfo?.roomCode || isRemote.current) {
      isRemote.current = false
      return
    }
    isRemote.current = false

    setSyncStatus(SYNC_STATUS.SYNCING)
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from(TABLE)
          .upsert(
            { room_code: syncInfo.roomCode, state, updated_at: new Date().toISOString(), updated_by: syncInfo.userName },
            { onConflict: 'room_code' }
          )
        if (error) throw error
        setSyncStatus(SYNC_STATUS.SYNCED)
        setLastSynced(new Date())
      } catch (err) {
        console.error('[Sync] push error:', err.message)
        setSyncStatus(SYNC_STATUS.ERROR)
      }
    }, 1000) // 1 second debounce
  }, [state])

  // ── 2. Subscribe to Supabase Realtime when room changes ─────
  // Stable string refs to avoid object identity issues
  const roomCodeRef = useRef(null)
  const userNameRef = useRef(null)

  useEffect(() => {
    const roomCode = syncInfo?.roomCode || null
    const userName = syncInfo?.userName || ''

    // Store in refs so the realtime callback always reads latest value
    roomCodeRef.current = roomCode
    userNameRef.current = userName

    // Cleanup previous channel
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current)
      channelRef.current = null
    }

    if (!SUPABASE_READY || !roomCode) return

    let cancelled = false

    // Pull latest state on mount / room change
    setSyncStatus(SYNC_STATUS.SYNCING)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select('state, updated_by, updated_at')
          .eq('room_code', roomCode)
          .maybeSingle()

        if (cancelled) return

        // maybeSingle() returns null data (not error) when no rows — no 406
        if (error) throw error

        if (data?.state) {
          isRemote.current = true
          dispatch({ type: 'HYDRATE', state: data.state })
          setLastSynced(new Date(data.updated_at))
          console.log('[Sync] Pulled initial state from room', roomCode)
        } else {
          console.log('[Sync] Room', roomCode, 'is new — will push local state')
        }
        setSyncStatus(SYNC_STATUS.SYNCED)
      } catch (err) {
        if (!cancelled) {
          console.error('[Sync] initial pull error:', err.message)
          setSyncStatus(SYNC_STATUS.ERROR)
        }
      }
    })()

    // Subscribe to real-time changes via Postgres CDC
    // Use a unique channel name with timestamp to avoid stale channel conflicts
    const channelName = `room_${roomCode}_${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  TABLE,
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const record = payload.new
          if (!record?.state) return
          // Use refs to get latest values without re-subscribing
          if (record.updated_by === userNameRef.current) return // ignore own echo
          console.log('[Sync] ⚡ Remote update from', record.updated_by)
          isRemote.current = true
          dispatch({ type: 'HYDRATE', state: record.state })
          setSyncStatus(SYNC_STATUS.SYNCED)
          setLastSynced(new Date(record.updated_at))
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Sync] ✅ Realtime channel active for room', roomCode)
          setSyncStatus(SYNC_STATUS.SYNCED)
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[Sync] Channel problem:', status)
          setSyncStatus(SYNC_STATUS.ERROR)
        }
      })

    channelRef.current = channel

    return () => {
      cancelled = true
      clearTimeout(pushTimer.current)
      supabase?.removeChannel(channel)
      channelRef.current = null
    }
  }, [syncInfo?.roomCode])

  // ── 3. Connect to a sync room ────────────────────────────────
  const connectRoom = useCallback((roomCode, userName) => {
    const info = { roomCode: roomCode.toUpperCase(), userName }
    setSyncInfo(info)
    saveSync(info)
  }, [])

  // ── 4. Disconnect ─────────────────────────────────────────────
  const disconnectRoom = useCallback(() => {
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setSyncInfo(null)
    setSyncStatus(SUPABASE_READY ? SYNC_STATUS.OFFLINE : SYNC_STATUS.NO_CONFIG)
    try { localStorage.removeItem(SYNC_KEY) } catch (_) {}
  }, [])

  // ── Computed values (memoized) ───────────────────────────────
  const saldo = useMemo(() => {
    const ent = state.txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0)
    const sai = Math.abs(state.txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0))
    return ent - sai
  }, [state.txs])

  const totals = useMemo(() => {
    const ent = state.txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0)
    const sai = Math.abs(state.txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0))
    return { ent, sai, saldo: ent - sai, guard: Math.max(0, ent - sai) }
  }, [state.txs])

  const gfData = useMemo(() => {
    const map = {}
    state.gfs.forEach(g => { map[g.id] = { total: 0, gabriel: 0, gabi: 0, txs: [] } })
    state.txs
      .filter(t => t.type === 'out' && t.gfId && map[t.gfId])
      .forEach(t => {
        const v = Math.abs(t.amount)
        map[t.gfId].total += v
        if (t.owner === 'Gabriel') map[t.gfId].gabriel += v
        else                       map[t.gfId].gabi    += v
        map[t.gfId].txs.push(t)
      })
    return map
  }, [state.txs, state.gfs])

  const unreadCount = useMemo(
    () => state.notifs.filter(n => !n.read).length,
    [state.notifs]
  )

  const lazerTotal = useMemo(
    () => state.txs.filter(t => t.type === 'out' && t.cat === 'Lazer').reduce((s, t) => s + Math.abs(t.amount), 0),
    [state.txs]
  )

  return (
    <FinanceContext.Provider value={{
      ...state,
      saldo, totals, gfData, unreadCount, lazerTotal,
      syncInfo, syncStatus, lastSynced,
      connectRoom, disconnectRoom,
      dispatch,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider')
  return ctx
}
