-- Add UNIQUE constraint to telefone column in follow_ups_inteligentes table
ALTER TABLE follow_ups_inteligentes ADD CONSTRAINT follow_ups_inteligentes_telefone_unique UNIQUE (telefone);