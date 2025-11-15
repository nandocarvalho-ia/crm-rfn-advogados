-- =====================================================
-- MIGRATION: Sistema de Chat ao Vivo - RFN Advogados
-- Instância: roger | IA: Rafael
-- =====================================================

-- 1. Adicionar colunas faltantes em leads_roger
ALTER TABLE leads_roger 
ADD COLUMN IF NOT EXISTS user_number TEXT,
ADD COLUMN IF NOT EXISTS phone_last_8 TEXT,
ADD COLUMN IF NOT EXISTS campanha TEXT,
ADD COLUMN IF NOT EXISTS etapa_atual TEXT,
ADD COLUMN IF NOT EXISTS last_interaction TIMESTAMPTZ;

-- 2. Criar função para atualizar phone_last_8 automaticamente
CREATE OR REPLACE FUNCTION update_phone_last_8_roger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone_last_8 := RIGHT(REGEXP_REPLACE(COALESCE(NEW.user_number, NEW.telefone::TEXT), '\D', '', 'g'), 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para atualizar phone_last_8
DROP TRIGGER IF EXISTS trigger_phone_last_8_roger ON leads_roger;
CREATE TRIGGER trigger_phone_last_8_roger
BEFORE INSERT OR UPDATE ON leads_roger
FOR EACH ROW
EXECUTE FUNCTION update_phone_last_8_roger();

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_roger_user_number ON leads_roger(user_number);
CREATE INDEX IF NOT EXISTS idx_leads_roger_phone8 ON leads_roger(phone_last_8);
CREATE INDEX IF NOT EXISTS idx_chat_roger_session ON n8n_chat_histories_roger(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_roger_timestamp ON n8n_chat_histories_roger(timestamp DESC);

-- 5. Habilitar RLS nas tabelas
ALTER TABLE n8n_chat_histories_roger ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_roger ENABLE ROW LEVEL SECURITY;
ALTER TABLE "[FLUXO] • IA" ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para n8n_chat_histories_roger
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON n8n_chat_histories_roger;
CREATE POLICY "Permitir leitura para usuários autenticados"
ON n8n_chat_histories_roger
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON n8n_chat_histories_roger;
CREATE POLICY "Permitir inserção para usuários autenticados"
ON n8n_chat_histories_roger
FOR INSERT
WITH CHECK (true);

-- 7. Criar políticas RLS para leads_roger (se não existirem)
DROP POLICY IF EXISTS "Permitir leitura leads_roger" ON leads_roger;
CREATE POLICY "Permitir leitura leads_roger"
ON leads_roger
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Permitir atualização leads_roger" ON leads_roger;
CREATE POLICY "Permitir atualização leads_roger"
ON leads_roger
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 8. Criar políticas RLS para [FLUXO] • IA (se não existirem)
DROP POLICY IF EXISTS "Permitir leitura fluxo ia" ON "[FLUXO] • IA";
CREATE POLICY "Permitir leitura fluxo ia"
ON "[FLUXO] • IA"
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Permitir atualização fluxo ia" ON "[FLUXO] • IA";
CREATE POLICY "Permitir atualização fluxo ia"
ON "[FLUXO] • IA"
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir inserção fluxo ia" ON "[FLUXO] • IA";
CREATE POLICY "Permitir inserção fluxo ia"
ON "[FLUXO] • IA"
FOR INSERT
WITH CHECK (true);

-- 9. Habilitar Real-time (REPLICA IDENTITY já ativado)
ALTER TABLE n8n_chat_histories_roger REPLICA IDENTITY FULL;
ALTER TABLE leads_roger REPLICA IDENTITY FULL;
ALTER TABLE "[FLUXO] • IA" REPLICA IDENTITY FULL;

-- Adicionar apenas n8n_chat_histories_roger e [FLUXO] • IA (leads_roger já está)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'n8n_chat_histories_roger'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE n8n_chat_histories_roger;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = '[FLUXO] • IA'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "[FLUXO] • IA";
  END IF;
END $$;