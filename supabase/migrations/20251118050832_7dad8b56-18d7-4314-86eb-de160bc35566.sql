-- Garantir que timestamp sempre seja preenchido com horário de São Paulo
ALTER TABLE public.n8n_chat_histories_roger 
  ALTER COLUMN timestamp SET DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo');

-- Preencher timestamp onde estiver nulo (fallback para data atual)
UPDATE public.n8n_chat_histories_roger
SET timestamp = (NOW() AT TIME ZONE 'America/Sao_Paulo')
WHERE timestamp IS NULL;

-- Adicionar índice para performance em queries de timestamp
CREATE INDEX IF NOT EXISTS idx_chat_roger_timestamp 
ON public.n8n_chat_histories_roger (timestamp DESC);

-- Índice composto para queries por sessão + timestamp
CREATE INDEX IF NOT EXISTS idx_chat_roger_session_ts 
ON public.n8n_chat_histories_roger (session_id, timestamp DESC);