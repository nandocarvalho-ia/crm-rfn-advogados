-- Substituir 'NÃO QUALIFICADO' por 'DESQUALIFICADO' na tabela leads_roger
UPDATE leads_roger 
SET categoria_lead = 'DESQUALIFICADO' 
WHERE categoria_lead = 'NÃO QUALIFICADO';

-- Adicionar comentário sobre a mudança
COMMENT ON COLUMN leads_roger.categoria_lead IS 'Categoria do lead. Valores possíveis: PREMIUM_ATRASO, PREMIUM_TEMPO, A_EXCELENTE, B_MUITO_BOM, C_BOM, D_REGULAR, E_BAIXO, DESQUALIFICADO. O valor NÃO QUALIFICADO foi descontinuado em favor de DESQUALIFICADO.';