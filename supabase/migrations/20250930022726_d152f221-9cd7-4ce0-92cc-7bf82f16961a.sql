-- Adicionar campos de controle de envio na tabela follow_ups_inteligentes
ALTER TABLE follow_ups_inteligentes 
ADD COLUMN IF NOT EXISTS status_envio VARCHAR(20) DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS tentativas_envio INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS log_envio JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS data_envio_real TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS webhook_n8n_url TEXT,
ADD COLUMN IF NOT EXISTS horario_comercial_inicio TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS horario_comercial_fim TIME DEFAULT '20:00:00';

-- Criar índices para otimizar consultas de envio
CREATE INDEX IF NOT EXISTS idx_follow_ups_envio_pendente 
ON follow_ups_inteligentes (status_envio, created_at) 
WHERE status_envio = 'pendente';

-- Função para verificar horário comercial
CREATE OR REPLACE FUNCTION public.is_business_hours(
  inicio TIME DEFAULT '08:00:00',
  fim TIME DEFAULT '20:00:00'
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se é dia útil (segunda a sexta)
  IF EXTRACT(DOW FROM NOW()) IN (0, 6) THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se está dentro do horário comercial
  RETURN (CURRENT_TIME BETWEEN inicio AND fim);
END;
$$;

-- Configurar cron job para executar a cada 5 minutos
SELECT cron.schedule(
  'send-scheduled-followups',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT
    net.http_post(
      url := 'https://mugrbcstwkkhvpsvuhjp.supabase.co/functions/v1/send-scheduled-followups',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3JiY3N0d2traHZwc3Z1aGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDQzNzMsImV4cCI6MjA2NTYyMDM3M30.Pc7pKY_hAgLxh4BzLPmQ_HXSChYmmZD4E9gV56I-Rmg"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);