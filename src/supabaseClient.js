import { createClient } from '@supabase/supabase-js'

// Projeto: finanças | sa-east-1 (São Paulo)
const SUPABASE_URL = 'https://sdhwwvfbqcnyylsysoql.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaHd3dmZicWNueXlsc3lzb3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzODAsImV4cCI6MjA4ODI2NDM4MH0.p3jEbiooyJ48dDaMtcf5GR_Mn2V3elD5eMaZJaWUabg'

export const supabase      = createClient(SUPABASE_URL, SUPABASE_KEY)
export const SUPABASE_READY = true
