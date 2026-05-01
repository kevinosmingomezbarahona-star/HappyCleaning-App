import { useState, useCallback, useMemo } from 'react';
import { MessageSquare, BarChart3, Home } from 'lucide-react';
import { WaterCutBanner } from './components/WaterCutBanner';
import { ChatAgent } from './components/ChatAgent';
import { GamifiedDashboard } from './components/GamifiedDashboard';
import { CatStatusGrid } from './components/CatStatusGrid';
import { BountyMarketPanel } from './components/BountyMarketPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { UmapsTaskList } from './components/UmapsTaskList';
import { TaskFeed } from './components/TaskFeed';
import {
  mockMembers,
  mockCats,
  mockWorkOrders,
  mockBounties,
  mockInventory,
  mockPreferences,
  mockStreaks,
  mockWaterCut,
} from './data/mockData';
import { deductConsumable } from './lib/inventory';
import type { ProductInventory, WorkOrder, Cat } from './types';

type Tab = 'chat' | 'panel' | 'hogar';

function isLitterOverdue(cats: Cat[]): boolean {
  return cats.some((c) => {
    if (!c.last_litter_cleaned) return true;
    const hours = (Date.now() - new Date(c.last_litter_cleaned).getTime()) / 3600000;
    return hours >= 12;
  });
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [waterCut, setWaterCut] = useState(mockWaterCut);
  const [inventory, setInventory] = useState<ProductInventory[]>(mockInventory);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [cats, setCats] = useState<Cat[]>(mockCats);

  const litterOverdue = useMemo(() => isLitterOverdue(cats), [cats]);

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'complete_litter': {
        const litterTask = workOrders.find((w) => w.category === 'litter' && w.status === 'pending');
        if (litterTask) {
          setWorkOrders((prev) =>
            prev.map((w) =>
              w.id === litterTask.id
                ? { ...w, status: 'completed' as const, completed_at: new Date().toISOString() }
                : w
            )
          );
        }
        if (litterTask?.consumable_id) {
          setInventory((prev) =>
            deductConsumable(prev, litterTask.consumable_id!, litterTask.consumable_quantity)
          );
        }
        setCats((prev) =>
          prev.map((c) => ({
            ...c,
            mood: 'happy' as const,
            last_litter_cleaned: new Date().toISOString(),
          }))
        );
        break;
      }
      case 'fair_divide':
        setActiveTab('panel');
        break;
      case 'view_tasks':
      case 'view_dry_tasks':
      case 'view_inventory':
        break;
      case 'toggle_water':
        setWaterCut((prev) => ({ ...prev, is_active: !prev.is_active }));
        break;
    }
  }, [workOrders]);

  const handleCompleteTask = useCallback((taskId: string) => {
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === taskId
          ? { ...w, status: 'completed' as const, completed_at: new Date().toISOString() }
          : w
      )
    );
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Water Cut Banner */}
      <WaterCutBanner waterCut={waterCut} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatAgent
                members={mockMembers}
                workOrders={workOrders}
                cats={cats}
                inventory={inventory}
                waterCutActive={waterCut.is_active}
                litterOverdue={litterOverdue}
                onAction={handleAction}
              />
            </div>
          )}

          {/* Panel Principal */}
          {activeTab === 'panel' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Panel Principal</h1>
                    <p className="text-xs text-gray-500">Gestión del hogar en tiempo real</p>
                  </div>
                  <button
                    onClick={() => setWaterCut((prev) => ({ ...prev, is_active: !prev.is_active }))}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      waterCut.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {waterCut.is_active ? 'UMAPS Activo' : 'Simular UMAPS'}
                  </button>
                </div>

                {/* Cat Status */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Estado de los Gatos</h3>
                  <CatStatusGrid cats={cats} litterOverdue={litterOverdue} />
                </div>

                {/* UMAPS Task List */}
                <UmapsTaskList
                  workOrders={workOrders}
                  members={mockMembers}
                  waterCutActive={waterCut.is_active}
                  onCompleteTask={handleCompleteTask}
                />

                {/* Tablero de Gamificación */}
                <GamifiedDashboard
                  members={mockMembers}
                  streaks={mockStreaks}
                  preferences={mockPreferences}
                  workOrders={workOrders}
                />

                {/* Cuadrícula de dos columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InventoryPanel inventory={inventory} />
                  <BountyMarketPanel
                    bounties={mockBounties}
                    members={mockMembers}
                    workOrders={workOrders}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hogar Panel — Mobile-First Task Feed */}
          {activeTab === 'hogar' && (
            <div className="flex-1 min-h-0 flex flex-col bg-gray-50">
              <TaskFeed
                workOrders={workOrders}
                members={mockMembers}
                inventory={inventory}
                waterCutActive={waterCut.is_active}
                onCompleteTask={handleCompleteTask}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 bg-white border-t border-gray-200 px-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {[
            { id: 'chat' as Tab, icon: MessageSquare, label: 'Chat' },
            { id: 'panel' as Tab, icon: BarChart3, label: 'Panel' },
            { id: 'hogar' as Tab, icon: Home, label: 'Hogar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === tab.id ? 'scale-110' : ''
                }`}
              />
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
