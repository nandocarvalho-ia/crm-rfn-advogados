-- Remover trigger que força categoria_lead = 'DESQUALIFICADO'
DROP TRIGGER IF EXISTS trigger_sync_categoria_lead ON leads_roger;

-- Remover função que controlava a categoria
DROP FUNCTION IF EXISTS sync_categoria_lead_on_desqualificado();

-- Comentário explicativo
COMMENT ON COLUMN leads_roger.categoria_lead IS 
'Categoria do lead gerenciada exclusivamente pelo agente N8N. Valores possíveis: NÃO QUALIFICADO, POTENCIAL BOM, BOM, POTENCIAL EXCELENTE, EXCELENTE';