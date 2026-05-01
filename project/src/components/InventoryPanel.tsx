import { Package, AlertTriangle, TrendingDown } from 'lucide-react';
import type { ProductInventory } from '../types';
import { getStockLevel } from '../lib/inventory';

interface InventoryPanelProps {
  inventory: ProductInventory[];
}

export function InventoryPanel({ inventory }: InventoryPanelProps) {
  const lowItems = inventory.filter((i) => getStockLevel(i) !== 'good');
  const criticalItems = inventory.filter((i) => getStockLevel(i) === 'critical');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-800">Inventario</h3>
        {criticalItems.length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            {criticalItems.length} crítico{criticalItems.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {inventory.map((item) => {
          const level = getStockLevel(item);
          const percentage = Math.min(
            100,
            (item.current_stock / (item.min_threshold * 3)) * 100
          );

          return (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700 truncate">{item.name}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      level === 'critical'
                        ? 'text-red-600'
                        : level === 'low'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    {item.current_stock} {item.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      level === 'critical'
                        ? 'bg-red-500'
                        : level === 'low'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              {level === 'critical' && (
                <TrendingDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {lowItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {lowItems.length} producto{lowItems.length > 1 ? 's' : ''} bajo mínimo
          </p>
        </div>
      )}
    </div>
  );
}
