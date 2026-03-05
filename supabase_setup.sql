-- Execute este SQL no Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → cole e execute

CREATE TABLE IF NOT EXISTS couple_data (
  room_code    TEXT         PRIMARY KEY,
  state        JSONB        NOT NULL,
  updated_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_by   TEXT
);

-- Habilitar Row Level Security
ALTER TABLE couple_data ENABLE ROW LEVEL SECURITY;

-- Política: qualquer um pode ler/escrever (acesso por room_code = senha implícita)
-- Para maior segurança em produção, use auth + policies mais restritas
CREATE POLICY "allow_all" ON couple_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Habilitar Realtime (necessário para sync em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE couple_data;
