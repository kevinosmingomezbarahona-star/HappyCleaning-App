import { Gavel, Coins, User, CheckCircle } from 'lucide-react';
import type { BountyMarket, HouseholdMember, WorkOrder } from '../types';

interface BountyMarketPanelProps {
  bounties: BountyMarket[];
  members: HouseholdMember[];
  workOrders: WorkOrder[];
  onClaim?: (bountyId: string) => void;
}

export function BountyMarketPanel({
  bounties,
  members,
  workOrders,
  onClaim,
}: BountyMarketPanelProps) {
  const openBounties = bounties.filter((b) => b.status === 'open');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gavel className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-800">Mercado de Recompensas</h3>
        {openBounties.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
            {openBounties.length} disponible{openBounties.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {openBounties.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          No hay recompensas disponibles ahora
        </p>
      ) : (
        <div className="space-y-2">
          {openBounties.map((bounty) => {
            const task = workOrders.find((w) => w.id === bounty.work_order_id);
            const poster = members.find((m) => m.id === bounty.posted_by);

            return (
              <div
                key={bounty.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {task?.title || 'Tarea desconocida'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      Publicado por {poster?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Coins className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">
                    {bounty.coin_reward}
                  </span>
                </div>

                <button
                  onClick={() => onClaim?.(bounty.id)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3 h-3" />
                  Reclamar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
