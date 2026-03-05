// Arquivo legado — redirecionando para o cliente principal
// Não use este arquivo diretamente. Use: import { supabase } from '../supabaseClient.js'
export { supabase, SUPABASE_READY } from '../supabaseClient.js'
export const CONFIGURED = true
export const getSupabase = () => { throw new Error('Use supabaseClient.js direto') }
