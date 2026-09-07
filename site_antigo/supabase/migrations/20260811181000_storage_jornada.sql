-- Bucket privado para evidências
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('jornada-evidencias', 'jornada-evidencias', false, 5242880, '{image/jpeg,image/png,image/webp}')
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Serviço pode tudo em evidencias" ON storage.objects
    FOR ALL TO service_role USING (bucket_id = 'jornada-evidencias');

CREATE POLICY "Clientes podem fazer upload em evidencias" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'jornada-evidencias' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Clientes podem ver suas proprias fotos via URL assinada" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'jornada-evidencias' AND (storage.foldername(name))[1] = auth.uid()::text);
