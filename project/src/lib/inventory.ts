import type { ProductInventory } from '../types';

export function deductConsumable(
  inventory: ProductInventory[],
  consumableId: string,
  quantity: number
): ProductInventory[] {
  return inventory.map((item) => {
    if (item.id === consumableId) {
      return {
        ...item,
        current_stock: Math.max(0, item.current_stock - quantity),
      };
    }
    return item;
  });
}

export function isLowStock(item: ProductInventory): boolean {
  return item.current_stock <= item.min_threshold;
}

export function isCriticalStock(item: ProductInventory): boolean {
  return item.current_stock <= item.min_threshold * 0.5;
}

export function getStockLevel(
  item: ProductInventory
): 'good' | 'low' | 'critical' {
  if (isCriticalStock(item)) return 'critical';
  if (isLowStock(item)) return 'low';
  return 'good';
}
