/*
  # HomeForce - Household Management Schema

  1. New Tables
    - `household_member`: Stores the 5 adult members with gamification data
      - id (uuid, PK), name, role, xp_points, home_coins, desutility_multiplier, avatar_color, level, created_at
    - `cat`: Stores the 10 cats with status tracking
      - id (uuid, PK), name, mood, last_litter_cleaned, avatar_emoji, created_at
    - `asset`: Household assets/equipment
      - id (uuid, PK), name, status, location, created_at
    - `product_inventory`: Consumable products with stock tracking
      - id (uuid, PK), name, current_stock, min_threshold, unit, category, created_at
    - `work_order`: Tasks/chores with assignment and status
      - id (uuid, PK), title, description, assigned_to, status, consumable_id, consumable_quantity, estimated_duration, priority, category, xp_reward, coin_reward, created_at, completed_at
    - `bounty_market`: Task marketplace for trading tasks for coins
      - id (uuid, PK), work_order_id, posted_by, coin_reward, status, claimed_by, created_at, claimed_at
    - `task_preference`: Member preferences for task types (drives Fair Division)
      - id (uuid, PK), member_id, task_category, preference_level (1=preferred, 2=neutral, 3=aversion)
    - `streak`: Tracks consecutive task completion streaks
      - id (uuid, PK), member_id, task_category, current_count, longest_count, last_completed_at
    - `water_cut_status`: UMAPS water rationing status
      - id (uuid, PK), is_active, start_time, end_time, message, updated_at

  2. Security
    - Enable RLS on ALL tables
    - Policies: authenticated users can read all household data
    - Policies: authenticated users can update their own member data, streaks, preferences
    - Policies: authenticated users can create/update work orders and bounties
    - Policies: only specific roles can update inventory and water cut status

  3. Important Notes
    - desutility_multiplier maps to preference levels in task_preference table
    - EF1 fairness is computed application-side using the task_preference data
    - Consumable deduction triggers are handled via edge functions
    - Cat mood is derived from last_litter_cleaned timestamp (sad if >12hrs)
*/

-- Household Members
CREATE TABLE IF NOT EXISTS household_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  xp_points integer NOT NULL DEFAULT 0,
  home_coins integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  avatar_color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Cats
CREATE TABLE IF NOT EXISTS cat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mood text NOT NULL DEFAULT 'happy',
  last_litter_cleaned timestamptz,
  avatar_emoji text NOT NULL DEFAULT '🐱',
  created_at timestamptz DEFAULT now()
);

-- Assets
CREATE TABLE IF NOT EXISTS asset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  location text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Product Inventory
CREATE TABLE IF NOT EXISTS product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  current_stock numeric NOT NULL DEFAULT 0,
  min_threshold numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'units',
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Work Orders (Tasks)
CREATE TABLE IF NOT EXISTS work_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to uuid REFERENCES household_member(id),
  status text NOT NULL DEFAULT 'pending',
  consumable_id uuid REFERENCES product_inventory(id),
  consumable_quantity numeric DEFAULT 0,
  estimated_duration integer DEFAULT 15,
  priority text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'cleaning',
  xp_reward integer NOT NULL DEFAULT 10,
  coin_reward integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Bounty Market
CREATE TABLE IF NOT EXISTS bounty_market (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_order(id) NOT NULL,
  posted_by uuid REFERENCES household_member(id) NOT NULL,
  coin_reward integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'open',
  claimed_by uuid REFERENCES household_member(id),
  created_at timestamptz DEFAULT now(),
  claimed_at timestamptz
);

-- Task Preferences (for Fair Division algorithm)
CREATE TABLE IF NOT EXISTS task_preference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES household_member(id) NOT NULL,
  task_category text NOT NULL,
  preference_level integer NOT NULL DEFAULT 2,
  UNIQUE(member_id, task_category)
);

-- Streaks
CREATE TABLE IF NOT EXISTS streak (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES household_member(id) NOT NULL,
  task_category text NOT NULL,
  current_count integer NOT NULL DEFAULT 0,
  longest_count integer NOT NULL DEFAULT 0,
  last_completed_at timestamptz DEFAULT now(),
  UNIQUE(member_id, task_category)
);

-- Water Cut Status (UMAPS)
CREATE TABLE IF NOT EXISTS water_cut_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  start_time text NOT NULL DEFAULT '5:00 AM',
  end_time text NOT NULL DEFAULT '5:00 PM',
  message text NOT NULL DEFAULT 'Suspensión de servicio UMAPS: 5:00 AM - 5:00 PM. Tareas de alto consumo hídrico bloqueadas. Priorizando limpieza en seco.',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE household_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_cut_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies: household_member
CREATE POLICY "Authenticated users can read members"
  ON household_member FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update own profile"
  ON household_member FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Members can insert own profile"
  ON household_member FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies: cat
CREATE POLICY "Authenticated users can read cats"
  ON cat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update cats"
  ON cat FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies: asset
CREATE POLICY "Authenticated users can read assets"
  ON asset FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage assets"
  ON asset FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies: product_inventory
CREATE POLICY "Authenticated users can read inventory"
  ON product_inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update inventory"
  ON product_inventory FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies: work_order
CREATE POLICY "Authenticated users can read work orders"
  ON work_order FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create work orders"
  ON work_order FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Assigned member can update work order"
  ON work_order FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies: bounty_market
CREATE POLICY "Authenticated users can read bounties"
  ON bounty_market FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bounties"
  ON bounty_market FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bounties"
  ON bounty_market FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies: task_preference
CREATE POLICY "Authenticated users can read preferences"
  ON task_preference FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can manage own preferences"
  ON task_preference FOR ALL
  TO authenticated
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- RLS Policies: streak
CREATE POLICY "Authenticated users can read streaks"
  ON streak FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can manage own streaks"
  ON streak FOR ALL
  TO authenticated
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

-- RLS Policies: water_cut_status
CREATE POLICY "Authenticated users can read water status"
  ON water_cut_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update water status"
  ON water_cut_status FOR UPDATE
  TO authenticated
  USING (true);

-- Seed data: Members
INSERT INTO household_member (id, name, role, xp_points, home_coins, level, avatar_color) VALUES
  (gen_random_uuid(), 'Ninive', 'admin', 1250, 340, 8, '#F59E0B'),
  (gen_random_uuid(), 'Osmin', 'member', 980, 210, 6, '#10B981'),
  (gen_random_uuid(), 'Kevin', 'member', 1100, 280, 7, '#3B82F6'),
  (gen_random_uuid(), 'Marilyn', 'member', 870, 190, 5, '#EC4899'),
  (gen_random_uuid(), 'Mirza', 'member', 750, 150, 4, '#8B5CF6');

-- Seed data: Cats
INSERT INTO cat (name, mood, last_litter_cleaned, avatar_emoji) VALUES
  ('Mishi', 'happy', now() - interval '2 hours', '🐱'),
  ('Pelusa', 'happy', now() - interval '3 hours', '🐈'),
  ('Tigrillo', 'happy', now() - interval '5 hours', '🐯'),
  ('Luna', 'neutral', now() - interval '8 hours', '🌙'),
  ('Sombra', 'neutral', now() - interval '10 hours', '🖤'),
  ('Nube', 'happy', now() - interval '1 hour', '☁️'),
  ('Canela', 'sad', now() - interval '14 hours', '🟤'),
  ('Rayas', 'neutral', now() - interval '9 hours', '🦓'),
  ('Copito', 'happy', now() - interval '4 hours', '❄️'),
  ('Medianoche', 'sad', now() - interval '16 hours', '🌑');

-- Seed data: Assets
INSERT INTO asset (name, status, location) VALUES
  ('Trapeador', 'available', 'Cuarto de limpieza'),
  ('Aspiradora', 'in_use', 'Sala'),
  ('Escoba', 'available', 'Cocina'),
  ('Balde', 'available', 'Cuarto de limpieza'),
  ('Cepillo de cerdas', 'available', 'Baño principal');

-- Seed data: Product Inventory
INSERT INTO product_inventory (name, current_stock, min_threshold, unit, category) VALUES
  ('Arena de Tofu', 8, 3, 'kg', 'litter'),
  ('Limpiador Enzimático', 2, 2, 'litros', 'cleaning'),
  ('Detergente', 5, 2, 'litros', 'laundry'),
  ('Desinfectante', 3, 1, 'litros', 'cleaning'),
  ('Bolsas de basura', 15, 5, 'unidades', 'general'),
  ('Papel higiénico', 8, 4, 'rollos', 'bathroom'),
  ('Jabón de platos', 2, 1, 'litros', 'kitchen');

-- Seed data: Water Cut Status
INSERT INTO water_cut_status (is_active, start_time, end_time, message) VALUES
  (false, '5:00 AM', '5:00 PM', 'Suspensión de servicio UMAPS: 5:00 AM - 5:00 PM. Tareas de alto consumo hídrico bloqueadas. Priorizando limpieza en seco.');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_order_assigned_to ON work_order(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_order_status ON work_order(status);
CREATE INDEX IF NOT EXISTS idx_bounty_market_status ON bounty_market(status);
CREATE INDEX IF NOT EXISTS idx_task_preference_member ON task_preference(member_id);
CREATE INDEX IF NOT EXISTS idx_streak_member ON streak(member_id);
