export interface HouseholdMember {
  id: string;
  name: string;
  role: string;
  xp_points: number;
  home_coins: number;
  level: number;
  avatar_color: string;
}

export interface Cat {
  id: string;
  name: string;
  mood: 'happy' | 'neutral' | 'sad';
  last_litter_cleaned: string | null;
  avatar_emoji: string;
}

export interface Asset {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance';
  location: string;
}

export interface ProductInventory {
  id: string;
  name: string;
  current_stock: number;
  min_threshold: number;
  unit: string;
  category: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  consumable_id: string | null;
  consumable_quantity: number;
  estimated_duration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  xp_reward: number;
  coin_reward: number;
  created_at: string;
  completed_at: string | null;
}

export interface BountyMarket {
  id: string;
  work_order_id: string;
  posted_by: string;
  coin_reward: number;
  status: 'open' | 'claimed' | 'completed';
  claimed_by: string | null;
  created_at: string;
  claimed_at: string | null;
}

export interface TaskPreference {
  id: string;
  member_id: string;
  task_category: string;
  preference_level: 1 | 2 | 3;
}

export interface Streak {
  id: string;
  member_id: string;
  task_category: string;
  current_count: number;
  longest_count: number;
  last_completed_at: string;
}

export interface WaterCutStatus {
  id: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
  message: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  actions?: ChatAction[];
}

export interface ChatAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}
