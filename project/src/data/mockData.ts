import type {
  HouseholdMember,
  Cat,
  Asset,
  ProductInventory,
  WorkOrder,
  BountyMarket,
  TaskPreference,
  Streak,
  WaterCutStatus,
} from '../types';

export const mockMembers: HouseholdMember[] = [
  { id: '1', name: 'Ninive', role: 'admin', xp_points: 1250, home_coins: 340, level: 8, avatar_color: '#F59E0B' },
  { id: '2', name: 'Osmin', role: 'member', xp_points: 980, home_coins: 210, level: 6, avatar_color: '#10B981' },
  { id: '3', name: 'Kevin', role: 'member', xp_points: 1100, home_coins: 280, level: 7, avatar_color: '#3B82F6' },
  { id: '4', name: 'Marilyn', role: 'member', xp_points: 870, home_coins: 190, level: 5, avatar_color: '#EC4899' },
  { id: '5', name: 'Mirza', role: 'member', xp_points: 750, home_coins: 150, level: 4, avatar_color: '#8B5CF6' },
];

// 10 real cats: 7 males, 3 females
export const mockCats: Cat[] = [
  { id: 'c1', name: 'Dayson', mood: 'happy', last_litter_cleaned: new Date(Date.now() - 2 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c2', name: 'Tom', mood: 'happy', last_litter_cleaned: new Date(Date.now() - 3 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c3', name: 'Jerry', mood: 'happy', last_litter_cleaned: new Date(Date.now() - 5 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c4', name: 'Oliver', mood: 'neutral', last_litter_cleaned: new Date(Date.now() - 8 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c5', name: 'Ricky', mood: 'neutral', last_litter_cleaned: new Date(Date.now() - 10 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c6', name: 'Felix', mood: 'happy', last_litter_cleaned: new Date(Date.now() - 1 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c7', name: 'Topo', mood: 'sad', last_litter_cleaned: new Date(Date.now() - 14 * 3600000).toISOString(), avatar_emoji: '🐱' },
  { id: 'c8', name: 'Brittney', mood: 'neutral', last_litter_cleaned: new Date(Date.now() - 9 * 3600000).toISOString(), avatar_emoji: '🐈' },
  { id: 'c9', name: 'Daisy', mood: 'happy', last_litter_cleaned: new Date(Date.now() - 4 * 3600000).toISOString(), avatar_emoji: '🐈' },
  { id: 'c10', name: 'Brisa', mood: 'sad', last_litter_cleaned: new Date(Date.now() - 16 * 3600000).toISOString(), avatar_emoji: '🐈' },
];

export const mockAssets: Asset[] = [
  { id: 'a1', name: 'Trapeador', status: 'available', location: 'Cuarto de limpieza' },
  { id: 'a2', name: 'Aspiradora', status: 'in_use', location: 'Sala' },
  { id: 'a3', name: 'Escoba', status: 'available', location: 'Cocina' },
  { id: 'a4', name: 'Balde', status: 'available', location: 'Cuarto de limpieza' },
  { id: 'a5', name: 'Cepillo de cerdas', status: 'available', location: 'Baño principal' },
];

export const mockInventory: ProductInventory[] = [
  { id: 'p1', name: 'Arena de Tofu', current_stock: 8, min_threshold: 3, unit: 'kg', category: 'litter' },
  { id: 'p2', name: 'Limpiador Enzimático', current_stock: 2, min_threshold: 2, unit: 'litros', category: 'cleaning' },
  { id: 'p3', name: 'Detergente', current_stock: 5, min_threshold: 2, unit: 'litros', category: 'laundry' },
  { id: 'p4', name: 'Desinfectante', current_stock: 3, min_threshold: 1, unit: 'litros', category: 'cleaning' },
  { id: 'p5', name: 'Bolsas de basura', current_stock: 15, min_threshold: 5, unit: 'unidades', category: 'general' },
  { id: 'p6', name: 'Papel higiénico', current_stock: 8, min_threshold: 4, unit: 'rollos', category: 'bathroom' },
  { id: 'p7', name: 'Jabón de platos', current_stock: 2, min_threshold: 1, unit: 'litros', category: 'kitchen' },
];

export const mockWorkOrders: WorkOrder[] = [
  { id: 'w1', title: 'Limpiar areneros', description: 'Limpiar los 4 areneros de la casa', assigned_to: '1', status: 'pending', consumable_id: 'p1', consumable_quantity: 0.5, estimated_duration: 20, priority: 'high', category: 'litter', xp_reward: 25, coin_reward: 10, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w2', title: 'Trapear cocina', description: 'Trapear el piso de la cocina', assigned_to: '2', status: 'pending', consumable_id: 'p4', consumable_quantity: 0.1, estimated_duration: 15, priority: 'medium', category: 'floor', xp_reward: 15, coin_reward: 5, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w3', title: 'Lavar ropa', description: 'Ciclo de lavado completo', assigned_to: '4', status: 'pending', consumable_id: 'p3', consumable_quantity: 0.2, estimated_duration: 30, priority: 'low', category: 'laundry', xp_reward: 20, coin_reward: 8, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w4', title: 'Lavar baño a fondo', description: 'Desinfectar sanitarios y lavamanos con agua', assigned_to: null, status: 'pending', consumable_id: 'p4', consumable_quantity: 0.15, estimated_duration: 25, priority: 'high', category: 'bathroom', xp_reward: 30, coin_reward: 12, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w5', title: 'Sacar basura', description: 'Recolectar y sacar todas las bolsas', assigned_to: '5', status: 'pending', consumable_id: 'p5', consumable_quantity: 1, estimated_duration: 10, priority: 'medium', category: 'waste', xp_reward: 10, coin_reward: 3, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w6', title: 'Aspirar sala', description: 'Aspirar alfombra y sillones', assigned_to: '3', status: 'in_progress', consumable_id: null, consumable_quantity: 0, estimated_duration: 20, priority: 'medium', category: 'floor', xp_reward: 15, coin_reward: 5, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w7', title: 'Reponer Arena (Bajo Polvo)', description: 'Agregar arena nueva a los areneros', assigned_to: null, status: 'pending', consumable_id: 'p1', consumable_quantity: 2, estimated_duration: 10, priority: 'critical', category: 'litter', xp_reward: 20, coin_reward: 8, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w8', title: 'Lavar platos', description: 'Lavar vajilla del día', assigned_to: '2', status: 'pending', consumable_id: 'p7', consumable_quantity: 0.05, estimated_duration: 15, priority: 'medium', category: 'kitchen', xp_reward: 10, coin_reward: 4, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w9', title: 'Rociar enzimático', description: 'Aplicar limpiador enzimático en seco sobre superficies', assigned_to: null, status: 'pending', consumable_id: 'p2', consumable_quantity: 0.1, estimated_duration: 10, priority: 'medium', category: 'dry_clean', xp_reward: 12, coin_reward: 5, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w10', title: 'Barrer pasillo', description: 'Barrer pisos del pasillo y entrada', assigned_to: null, status: 'pending', consumable_id: null, consumable_quantity: 0, estimated_duration: 10, priority: 'low', category: 'dry_clean', xp_reward: 8, coin_reward: 3, created_at: new Date().toISOString(), completed_at: null },
  { id: 'w11', title: 'Lavar piso a fondo', description: 'Lavado profundo con agua y jabón de todos los pisos', assigned_to: null, status: 'pending', consumable_id: 'p4', consumable_quantity: 0.3, estimated_duration: 40, priority: 'low', category: 'bathroom', xp_reward: 35, coin_reward: 15, created_at: new Date().toISOString(), completed_at: null },
];

export const mockBounties: BountyMarket[] = [
  { id: 'b1', work_order_id: 'w4', posted_by: '1', coin_reward: 15, status: 'open', claimed_by: null, created_at: new Date().toISOString(), claimed_at: null },
  { id: 'b2', work_order_id: 'w7', posted_by: '4', coin_reward: 12, status: 'open', claimed_by: null, created_at: new Date().toISOString(), claimed_at: null },
];

export const mockPreferences: TaskPreference[] = [
  { id: 'tp1', member_id: '1', task_category: 'litter', preference_level: 1 },
  { id: 'tp2', member_id: '1', task_category: 'kitchen', preference_level: 2 },
  { id: 'tp3', member_id: '1', task_category: 'bathroom', preference_level: 3 },
  { id: 'tp4', member_id: '1', task_category: 'dry_clean', preference_level: 2 },
  { id: 'tp5', member_id: '2', task_category: 'floor', preference_level: 1 },
  { id: 'tp6', member_id: '2', task_category: 'kitchen', preference_level: 1 },
  { id: 'tp7', member_id: '2', task_category: 'litter', preference_level: 3 },
  { id: 'tp8', member_id: '2', task_category: 'dry_clean', preference_level: 1 },
  { id: 'tp9', member_id: '3', task_category: 'floor', preference_level: 1 },
  { id: 'tp10', member_id: '3', task_category: 'laundry', preference_level: 2 },
  { id: 'tp11', member_id: '3', task_category: 'waste', preference_level: 1 },
  { id: 'tp12', member_id: '3', task_category: 'dry_clean', preference_level: 2 },
  { id: 'tp13', member_id: '4', task_category: 'laundry', preference_level: 1 },
  { id: 'tp14', member_id: '4', task_category: 'bathroom', preference_level: 2 },
  { id: 'tp15', member_id: '4', task_category: 'floor', preference_level: 3 },
  { id: 'tp16', member_id: '4', task_category: 'dry_clean', preference_level: 2 },
  { id: 'tp17', member_id: '5', task_category: 'waste', preference_level: 1 },
  { id: 'tp18', member_id: '5', task_category: 'litter', preference_level: 2 },
  { id: 'tp19', member_id: '5', task_category: 'kitchen', preference_level: 2 },
  { id: 'tp20', member_id: '5', task_category: 'dry_clean', preference_level: 1 },
];

export const mockStreaks: Streak[] = [
  { id: 's1', member_id: '1', task_category: 'litter', current_count: 7, longest_count: 12, last_completed_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 's2', member_id: '2', task_category: 'kitchen', current_count: 5, longest_count: 8, last_completed_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 's3', member_id: '3', task_category: 'floor', current_count: 3, longest_count: 6, last_completed_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: 's4', member_id: '4', task_category: 'laundry', current_count: 4, longest_count: 9, last_completed_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 's5', member_id: '5', task_category: 'waste', current_count: 6, longest_count: 10, last_completed_at: new Date(Date.now() - 8 * 3600000).toISOString() },
];

export const mockWaterCut: WaterCutStatus = {
  id: 'wc1',
  is_active: false,
  start_time: '5:00 AM',
  end_time: '5:00 PM',
  message: 'Suspensión de servicio UMAPS: 5:00 AM - 5:00 PM. Tareas de alto consumo hídrico bloqueadas. Priorizando limpieza en seco.',
  updated_at: new Date().toISOString(),
};

// Categories that consume water and are blocked during UMAPS
export const WATER_DEPENDENT_CATEGORIES = ['bathroom', 'laundry', 'floor'];

// Categories that are dry and prioritized during UMAPS
export const DRY_CATEGORIES = ['dry_clean', 'litter', 'waste', 'kitchen'];

// Family hygiene streak (days of consecutive critical routine completion)
export const FAMILY_HYGIENE_STREAK = 12;

// House chest progress
export const HOUSE_CHEST = {
  tasksCompleted: 35,
  tasksRequired: 50,
  possibleRewards: [
    'Elegir película de la noche',
    'Pase Libre de tareas por 1 día',
    'Elegir el menú del domingo',
    'Hora extra de streaming',
    'Elegir postre especial',
  ],
};
