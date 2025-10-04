-- Adicionar campo deleted_at para soft delete na tabela leads_roger
ALTER TABLE leads_roger 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Criar índice para melhorar performance das queries que filtram por deleted_at
CREATE INDEX idx_leads_roger_deleted_at ON leads_roger(deleted_at) WHERE deleted_at IS NULL;

-- Comentário explicativo
COMMENT ON COLUMN leads_roger.deleted_at IS 'Data de exclusão lógica do lead. NULL indica que o lead está ativo.';