/*
  # Fix RLS Policies - Remove Always-True Conditions

  1. Security Changes
    - `asset`: Replace ALL policy with separate INSERT/UPDATE/DELETE restricted to admin role
    - `bounty_market`: Replace unrestricted INSERT/UPDATE with ownership-based policies
    - `cat`: Replace unrestricted UPDATE with household membership check
    - `product_inventory`: Replace unrestricted UPDATE with admin-only policy
    - `water_cut_status`: Replace unrestricted UPDATE with admin-only policy
    - `work_order`: Replace unrestricted INSERT/UPDATE with membership/assignment checks

  2. Important Notes
    - All policies now enforce proper access control instead of USING(true)/WITH CHECK(true)
    - Admin role members can manage assets, inventory, water status
    - Members can only update bounties they posted or claimed
    - Members can only update work orders assigned to them or as admin
    - Cat updates restricted to verified household members
    - Existing SELECT policies are preserved
*/

-- Drop the overly permissive policies first

DROP POLICY IF EXISTS "Authenticated users can manage assets" ON asset;
DROP POLICY IF EXISTS "Authenticated users can create bounties" ON bounty_market;
DROP POLICY IF EXISTS "Authenticated users can update bounties" ON bounty_market;
DROP POLICY IF EXISTS "Authenticated users can update cats" ON cat;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON product_inventory;
DROP POLICY IF EXISTS "Authenticated users can update water status" ON water_cut_status;
DROP POLICY IF EXISTS "Authenticated users can create work orders" ON work_order;
DROP POLICY IF EXISTS "Assigned member can update work order" ON work_order;

-- Create properly restrictive replacement policies

-- asset: INSERT/UPDATE/DELETE restricted to admin
CREATE POLICY "Admin users can insert assets"
  ON asset FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update assets"
  ON asset FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete assets"
  ON asset FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  );

-- bounty_market: poster ownership for INSERT, poster/claimer for UPDATE
CREATE POLICY "Users can create bounties for own tasks"
  ON bounty_market FOR INSERT
  TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Users can update own posted or claimed bounties"
  ON bounty_market FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid() OR claimed_by = auth.uid())
  WITH CHECK (posted_by = auth.uid() OR claimed_by = auth.uid());

-- cat: only verified household members can update
CREATE POLICY "Household members can update cats"
  ON cat FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
    )
  );

-- product_inventory: only admin can update stock
CREATE POLICY "Admin users can update inventory"
  ON product_inventory FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  );

-- water_cut_status: only admin can toggle
CREATE POLICY "Admin users can update water status"
  ON water_cut_status FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  );

-- work_order: household members can create, assigned member or admin can update
CREATE POLICY "Household members can create work orders"
  ON work_order FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
    )
  );

CREATE POLICY "Assigned member or admin can update work order"
  ON work_order FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  )
  WITH CHECK (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_member
      WHERE household_member.id = auth.uid()
      AND household_member.role = 'admin'
    )
  );
