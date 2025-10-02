-- 1. Adicionar constraint UNIQUE no telefone se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'follow_ups_inteligentes_telefone_key'
  ) THEN
    ALTER TABLE follow_ups_inteligentes 
    ADD CONSTRAINT follow_ups_inteligentes_telefone_key UNIQUE(telefone);
  END IF;
END $$;

-- 2. Criar função de sincronização
CREATE OR REPLACE FUNCTION sync_followups_to_inteligentes()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se houve mudança nos campos followup_1/2/3
  IF (NEW.followup_1 IS DISTINCT FROM OLD.followup_1) OR
     (NEW.followup_2 IS DISTINCT FROM OLD.followup_2) OR
     (NEW.followup_3 IS DISTINCT FROM OLD.followup_3) OR
     (OLD IS NULL) THEN
    
    -- Upsert na tabela follow_ups_inteligentes
    INSERT INTO follow_ups_inteligentes (
      telefone,
      nome_lead,
      proximo_followup_1,
      proximo_followup_2,
      proximo_followup_3,
      tipo_situacao,
      status,
      updated_at
    ) VALUES (
      NEW.telefone,
      NEW.nome_lead,
      CASE 
        WHEN NEW.followup_1 IS NOT NULL AND NEW.followup_1 != '' 
        THEN NEW.followup_1::jsonb 
        ELSE NULL 
      END,
      CASE 
        WHEN NEW.followup_2 IS NOT NULL AND NEW.followup_2 != '' 
        THEN NEW.followup_2::jsonb 
        ELSE NULL 
      END,
      CASE 
        WHEN NEW.followup_3 IS NOT NULL AND NEW.followup_3 != '' 
        THEN NEW.followup_3::jsonb 
        ELSE NULL 
      END,
      'auto_sync',
      'ativo',
      NOW()
    )
    ON CONFLICT (telefone) 
    DO UPDATE SET
      nome_lead = EXCLUDED.nome_lead,
      proximo_followup_1 = EXCLUDED.proximo_followup_1,
      proximo_followup_2 = EXCLUDED.proximo_followup_2,
      proximo_followup_3 = EXCLUDED.proximo_followup_3,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger na tabela leads_roger
DROP TRIGGER IF EXISTS trigger_sync_followups ON leads_roger;
CREATE TRIGGER trigger_sync_followups
AFTER INSERT OR UPDATE OF followup_1, followup_2, followup_3 ON leads_roger
FOR EACH ROW
EXECUTE FUNCTION sync_followups_to_inteligentes();

-- 4. Sincronização inicial (backfill) de todos os leads existentes
INSERT INTO follow_ups_inteligentes (
  telefone, 
  nome_lead, 
  proximo_followup_1, 
  proximo_followup_2, 
  proximo_followup_3, 
  tipo_situacao, 
  status,
  created_at,
  updated_at
)
SELECT 
  telefone, 
  nome_lead,
  CASE 
    WHEN followup_1 IS NOT NULL AND followup_1 != '' 
    THEN followup_1::jsonb 
    ELSE NULL 
  END,
  CASE 
    WHEN followup_2 IS NOT NULL AND followup_2 != '' 
    THEN followup_2::jsonb 
    ELSE NULL 
  END,
  CASE 
    WHEN followup_3 IS NOT NULL AND followup_3 != '' 
    THEN followup_3::jsonb 
    ELSE NULL 
  END,
  'auto_sync',
  'ativo',
  NOW(),
  NOW()
FROM leads_roger
WHERE (followup_1 IS NOT NULL AND followup_1 != '') 
   OR (followup_2 IS NOT NULL AND followup_2 != '')
   OR (followup_3 IS NOT NULL AND followup_3 != '')
ON CONFLICT (telefone) 
DO UPDATE SET
  nome_lead = EXCLUDED.nome_lead,
  proximo_followup_1 = EXCLUDED.proximo_followup_1,
  proximo_followup_2 = EXCLUDED.proximo_followup_2,
  proximo_followup_3 = EXCLUDED.proximo_followup_3,
  updated_at = NOW();