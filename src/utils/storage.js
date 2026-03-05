// ─── Storage Utilities ───────────────────────────────────────
// Persist app state to localStorage so data survives refreshes

const STORAGE_KEY = 'casal_finance_v7'

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('[Storage] Failed to save:', err)
  }
}

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('[Storage] Failed to load:', err)
    return null
  }
}

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('[Storage] Failed to clear:', err)
  }
}
