-- Estacionamientos El Roble - Database Schema
-- Execute this in Supabase SQL Editor

-- Tabla de Personal
CREATE TABLE IF NOT EXISTS personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    cargo TEXT NOT NULL,
    photo_url TEXT,
    estado TEXT NOT NULL CHECK (estado IN ('Autorizado', 'No Autorizado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    ppu TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_personnel_rut ON personnel(rut);
CREATE INDEX IF NOT EXISTS idx_vehicles_personnel ON vehicles(personnel_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para aplicación estática)
DROP POLICY IF EXISTS "Enable read access for all users" ON personnel;
CREATE POLICY "Enable read access for all users" ON personnel
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON personnel;
CREATE POLICY "Enable insert access for all users" ON personnel
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON personnel;
CREATE POLICY "Enable update access for all users" ON personnel
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON personnel;
CREATE POLICY "Enable delete access for all users" ON personnel
    FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
CREATE POLICY "Enable read access for all users" ON vehicles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON vehicles;
CREATE POLICY "Enable insert access for all users" ON vehicles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON vehicles;
CREATE POLICY "Enable update access for all users" ON vehicles
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON vehicles;
CREATE POLICY "Enable delete access for all users" ON vehicles
    FOR DELETE USING (true);
