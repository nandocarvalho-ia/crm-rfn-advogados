-- Criar tabela para gerenciar follow-ups inteligentes
CREATE TABLE IF NOT EXISTS follow_ups_inteligentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone VARCHAR(20) NOT NULL,
  nome_lead VARCHAR(255),
  tipo_situacao VARCHAR(50) NOT NULL, -- 'parou_responder', 'dar_retorno', 'documentos_enviados', 'outros'
  status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'pausado', 'finalizado'
  ultima_resposta_lead TIMESTAMP WITH TIME ZONE,
  proximo_followup_1 JSONB, -- {data_envio, texto, status}
  proximo_followup_2 JSONB,
  proximo_followup_3 JSONB,
  contexto_conversa TEXT, -- Resumo das últimas mensagens para IA
  sugestoes_ia JSONB, -- Sugestões geradas pela IA
  configuracao_personalizada JSONB, -- Configurações específicas do usuário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_follow_ups_telefone ON follow_ups_inteligentes(telefone);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups_inteligentes(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_updated ON follow_ups_inteligentes(updated_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_follow_ups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_follow_ups_updated_at
    BEFORE UPDATE ON follow_ups_inteligentes
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_ups_updated_at();

-- Habilitar RLS
ALTER TABLE follow_ups_inteligentes ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total (ajustar conforme necessário)
CREATE POLICY "Permitir acesso aos follow-ups" ON follow_ups_inteligentes
FOR ALL USING (true) WITH CHECK (true);