-- Preencher dados históricos na coluna phone_last_8
UPDATE public.leads_roger
SET phone_last_8 = RIGHT(REGEXP_REPLACE(COALESCE(user_number, telefone::text), '\D', '', 'g'), 8)
WHERE phone_last_8 IS NULL OR phone_last_8 = '';