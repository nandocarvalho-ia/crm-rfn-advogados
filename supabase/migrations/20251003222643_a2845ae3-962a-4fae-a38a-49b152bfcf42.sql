-- Remover trigger de scoring automático que sobrescreve categoria_lead
DROP TRIGGER IF EXISTS trigger_scoring_automatico ON leads_roger;

-- Remover função de scoring automático
DROP FUNCTION IF EXISTS aplicar_scoring_automatico();