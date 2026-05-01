-- Migration: Add gender to cat and seed real household data
-- Date: 2026-05-01 09:00:00

-- 1. Update Schema
ALTER TABLE cat ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female'));

-- 2. Clear existing data to start fresh
-- Cascade will handle references in work_order, task_preference, etc.
TRUNCATE household_member CASCADE;
TRUNCATE cat CASCADE;
TRUNCATE work_order CASCADE;

-- 3. Seed Real Members
INSERT INTO household_member (name, role, xp_points, home_coins, level, avatar_color) VALUES
('Ninive', 'admin', 0, 0, 1, '#F59E0B'),
('Osmin', 'member', 0, 0, 1, '#10B981'),
('Kevin', 'member', 0, 0, 1, '#3B82F6'),
('Marilyn', 'member', 0, 0, 1, '#EC4899'),
('Mirza', 'member', 0, 0, 1, '#8B5CF6');

-- 4. Seed Real Cats
INSERT INTO cat (name, mood, avatar_emoji, gender) VALUES
('Dayson', 'happy', '🐱', 'male'),
('Tom', 'happy', '🐱', 'male'),
('Jerry', 'happy', '🐱', 'male'),
('Oliver', 'happy', '🐱', 'male'),
('Ricky', 'happy', '🐱', 'male'),
('Felix', 'happy', '🐱', 'male'),
('Topo', 'happy', '🐱', 'male'),
('Brittney', 'happy', '🐈', 'female'),
('Daisy', 'happy', '🐈', 'female'),
('Brisa', 'happy', '🐈', 'female');

-- 5. Seed Micro-Tasks (Work Orders)
INSERT INTO work_order (title, description, priority, category, xp_reward, coin_reward, estimated_duration) VALUES
('Lavar trastes', 'Usar agua hirviendo para la manteca/mal olor y limpiar orillas del fregadero con cepillo.', 'high', 'kitchen', 20, 10, 30),
('Limpieza profunda de baño', 'Restregar con detergente inodoro, paredes y piso.', 'high', 'bathroom', 50, 25, 45),
('Arenero — Limpieza de heces', 'Sacar heces cada 12h. Solo Limpiador Enzimático. PROHIBIDO cloro/amoníaco.', 'critical', 'litter', 15, 5, 10),
('Baño de gatos', 'Usar champú suave para gatos. Secar completamente con toalla para evitar hipotermia. Inspeccionar piel y orejas.', 'medium', 'cats', 40, 20, 60),
('Inspección felina continua', 'Revisar ojos, orejas, piel y comportamiento de cada gato. Anotar cualquier signo de malestar.', 'medium', 'cats', 10, 5, 15),
('Cambio de forros de muebles', 'Retirar todos los forros protectores de sillones y camas. Lavar en ciclo largo. Colocar forros limpios.', 'medium', 'cleaning', 30, 15, 40),
('Limpieza profunda del refrigerador', 'Sacar TODO. Limpiar con agua tibia y bicarbonato. Revisar fechas de vencimiento. Reorganizar.', 'medium', 'kitchen', 60, 30, 90),
('Trapear pisos', 'Usar agua caliente con desinfectante diluido. Comenzar desde el fondo hacia la salida.', 'medium', 'cleaning', 25, 12, 30),
('Sacar basura', 'Recolectar bolsas de todos los cuartos. Reemplazar bolsas vacías inmediatamente.', 'low', 'general', 10, 5, 10),
('Rociar enzimático', 'Aplicar Limpiador Enzimático en superficies que no puedan mojarse. Dejar actuar 5 minutos.', 'medium', 'cleaning', 15, 8, 10);
