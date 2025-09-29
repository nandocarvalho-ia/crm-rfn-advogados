-- Criar função para atualizar follow-up automaticamente
CREATE OR REPLACE FUNCTION update_followup_on_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    telefone_extraido TEXT;
    nome_lead_encontrado TEXT;
BEGIN
    -- Extrair telefone do session_id (formato: {telefone}roger)
    telefone_extraido := REPLACE(NEW.session_id, 'roger', '');
    
    -- Buscar nome do lead na tabela leads_roger
    SELECT nome_lead INTO nome_lead_encontrado 
    FROM leads_roger 
    WHERE telefone = telefone_extraido;
    
    -- Se encontrou o lead, atualizar timestamp e disparar análise de follow-up
    IF nome_lead_encontrado IS NOT NULL THEN
        -- Atualizar updated_at do lead
        UPDATE leads_roger 
        SET updated_at = NOW() 
        WHERE telefone = telefone_extraido;
        
        -- Chamar função assíncrona para analisar follow-up
        -- Usando pg_notify para não bloquear a transação
        PERFORM pg_notify(
            'followup_update', 
            json_build_object(
                'telefone', telefone_extraido,
                'nome_lead', nome_lead_encontrado,
                'timestamp', EXTRACT(EPOCH FROM NOW())
            )::text
        );
        
        RAISE NOTICE 'Follow-up update triggered for telefone: %', telefone_extraido;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela n8n_chat_histories_roger
DROP TRIGGER IF EXISTS trigger_update_followup_on_chat ON n8n_chat_histories_roger;

CREATE TRIGGER trigger_update_followup_on_chat
    AFTER INSERT ON n8n_chat_histories_roger
    FOR EACH ROW
    EXECUTE FUNCTION update_followup_on_chat_message();

-- Comentário explicativo
COMMENT ON FUNCTION update_followup_on_chat_message() IS 
'Função que extrai telefone do session_id e dispara atualização de follow-up via pg_notify';

COMMENT ON TRIGGER trigger_update_followup_on_chat ON n8n_chat_histories_roger IS 
'Trigger que monitora novas mensagens e atualiza follow-ups automaticamente';