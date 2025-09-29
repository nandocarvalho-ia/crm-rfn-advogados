-- Criar função que sincroniza categoria_lead quando status_qualificacao for 'desqualificado'
CREATE OR REPLACE FUNCTION sync_categoria_lead_on_desqualificado()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status_qualificacao for 'desqualificado', define categoria_lead como 'DESQUALIFICADO'
  IF NEW.status_qualificacao = 'desqualificado' THEN
    NEW.categoria_lead = 'DESQUALIFICADO';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger que executa a função antes de INSERT ou UPDATE
CREATE TRIGGER trigger_sync_categoria_lead
  BEFORE INSERT OR UPDATE ON leads_roger
  FOR EACH ROW
  EXECUTE FUNCTION sync_categoria_lead_on_desqualificado();

-- Atualizar dados existentes que estão inconsistentes
UPDATE leads_roger 
SET categoria_lead = 'DESQUALIFICADO' 
WHERE status_qualificacao = 'desqualificado' 
  AND categoria_lead != 'DESQUALIFICADO';