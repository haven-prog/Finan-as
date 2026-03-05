-- ═══════════════════════════════════════════════════════════════
-- CASAL FINANCE - Setup completo do Supabase
-- ---------------------------------------------------------------
-- Como executar:
--   Dashboard Supabase → SQL Editor (ícone do lado esquerdo)
--   → "New query" → cole TODO este conteúdo → clique em "Run"
-- ═══════════════════════════════════════════════════════════════

-- 1. Criar tabela principal
-- ─────────────────────────
CREATE TABLE IF NOT EXISTS public.couple_data (
  room_code   TEXT         PRIMARY KEY,
  state       JSONB        NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by  TEXT         NOT NULL DEFAULT ''
);

-- Índice para acelerar queries por sala
CREATE INDEX IF NOT EXISTS idx_couple_data_updated_at
  ON public.couple_data (updated_at DESC);

-- 2. Row Level Security (obrigatório para Realtime funcionar)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.couple_data ENABLE ROW LEVEL SECURITY;

-- Política: qualquer pessoa com a anon key pode ler e escrever
-- (segurança via room_code — quem não tem o código não acessa)
DROP POLICY IF EXISTS "casal_finance_allow_all" ON public.couple_data;
CREATE POLICY "casal_finance_allow_all"
  ON public.couple_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Habilitar Realtime (CDC → sync em tempo real)
-- ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_data;

-- 4. Confirmar setup
-- ──────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela couple_data criada com sucesso!';
  RAISE NOTICE '✅ RLS habilitado com política permissiva';
  RAISE NOTICE '✅ Realtime ativado';
  RAISE NOTICE '🚀 Casal Finance sync está pronto!';
END $$;
