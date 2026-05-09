import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, BarChart3, Home } from 'lucide-react';
import { WaterCutBanner } from './components/WaterCutBanner';
import { ChatAgent } from './components/ChatAgent';
import { GamifiedDashboard } from './components/GamifiedDashboard';
import { CatStatusGrid } from './components/CatStatusGrid';
import { BountyMarketPanel } from './components/BountyMarketPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { UmapsTaskList } from './components/UmapsTaskList';
import { TaskFeed } from './components/TaskFeed';
import { SplashScreen } from './components/SplashScreen';
import { Sanctuary } from './components/Sanctuary';
import { AuthScreen } from './components/AuthScreen';
import { sounds } from './lib/sounds';
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
import { supabase } from './lib/supabase';
import type { ProductInventory, WorkOrder, Cat, HouseholdMember } from './types';

type Tab = 'chat' | 'panel' | 'hogar';

// ─── Resolved auth user ─────────────────────────────────────────────────────
interface AuthUser {
  /** auth.uid() from Supabase, OR household_member.id if matched */
  id: string;
  displayName: string;
  /** household_member row if we found a match */
  member?: HouseholdMember;
}

function isLitterOverdue(cats: Cat[]): boolean {
  return cats.some((c) => {
    if (!c.last_litter_cleaned) return true;
    const hours = (Date.now() - new Date(c.last_litter_cleaned).getTime()) / 3600000;
    return hours >= 12;
  });
}

export default function App() {
  // ── Splash ─────────────────────────────────────────────────────────────────
  const [showSplash, setShowSplash] = useState(true);

  // ── Auth state ─────────────────────────────────────────────────────────────
  // null  → not yet determined (checking session)
  // false → no session (show login)
  // AuthUser → logged in
  const [authUser, setAuthUser] = useState<AuthUser | null | false>(null);

  // ── App data state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [waterCut, setWaterCut]   = useState(mockWaterCut);
  const [inventory, setInventory] = useState<ProductInventory[]>(mockInventory);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [cats, setCats]           = useState<Cat[]>(mockCats);

  const litterOverdue = useMemo(() => isLitterOverdue(cats), [cats]);

  // ── Resolve household_member from auth.uid() ──────────────────────────────
  const resolveUser = useCallback(async (userId: string, metaName?: string): Promise<AuthUser> => {
    try {
      const { data } = await supabase
        .from('household_member')
        .select('id, name, role, xp_points, home_coins, level, avatar_color, avatarUrl')
        .eq('auth_uid', userId)
        .maybeSingle();

      if (data) {
        const member = data as HouseholdMember;
        return { id: member.id, displayName: member.name, member };
      }
    } catch {
      // Fallback if table not yet migrated / auth_uid column missing
    }

    // Try matching by display_name in mockMembers (useful while DB is being migrated)
    const nameFallback = metaName ?? userId;
    const matchedMock  = mockMembers.find(
      (m) => m.name.toLowerCase() === nameFallback.toLowerCase()
    );

    return matchedMock
      ? { id: matchedMock.id, displayName: matchedMock.name, member: matchedMock }
      : { id: userId, displayName: nameFallback };
  }, []);

  // ── Listen to Supabase auth state changes ─────────────────────────────────
  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const user = data.session.user;
        const resolved = await resolveUser(user.id, user.user_metadata?.full_name);
        setAuthUser(resolved);
      } else {
        setAuthUser(false);
      }
    });

    // Subscribe to future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAuthUser(false);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user     = session.user;
          const resolved = await resolveUser(user.id, user.user_metadata?.full_name);
          setAuthUser(resolved);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [resolveUser]);

  // ── Called by AuthScreen on successful auth ────────────────────────────────
  const handleAuthenticated = useCallback(async (userId: string, displayName: string) => {
    const resolved = await resolveUser(userId, displayName);
    setAuthUser(resolved);
  }, [resolveUser]);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(false);
  }, []);

  // ── Task handlers ──────────────────────────────────────────────────────────
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
          if (litterTask.consumable_id) {
            setInventory((prev) =>
              deductConsumable(prev, litterTask.consumable_id!, litterTask.consumable_quantity)
            );
          }
        }
        setCats((prev) =>
          prev.map((c) => ({ ...c, mood: 'happy' as const, last_litter_cleaned: new Date().toISOString() }))
        );
        sounds.play('complete');
        break;
      }
      case 'fair_divide':
        setActiveTab('panel');
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
    sounds.play('complete');
  }, []);

  // ── Effective members list (replace mock entry if DB member is found) ──────
  const effectiveMembers = useMemo(() => {
    if (!authUser || authUser === false || !authUser.member) return mockMembers;
    return mockMembers.map((m) =>
      m.id === (authUser as AuthUser).id ? { ...m, ...(authUser as AuthUser).member } : m
    );
  }, [authUser]);

  // ─── Render flow ───────────────────────────────────────────────────────────

  // 1. Splash (always first)
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Determining session (brief loading state)
  if (authUser === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/30 text-xs tracking-widest uppercase">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  // 3. Not authenticated → show login
  if (authUser === false) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // 4. Main app
  const user = authUser as AuthUser;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Water Cut Banner */}
      <WaterCutBanner waterCut={waterCut} />

      {/* User greeting strip */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-1.5 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Hola,{' '}
          <span className="font-semibold text-gray-800">{user.displayName}</span>{' '}
          👋
        </p>
        <button
          id="logout-btn"
          onClick={handleSignOut}
          className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Cerrar sesión"
        >
          Salir
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">

          {/* CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatAgent
                members={effectiveMembers}
                workOrders={workOrders}
                cats={cats}
                inventory={inventory}
                waterCutActive={waterCut.is_active}
                litterOverdue={litterOverdue}
                onAction={handleAction}
              />
            </div>
          )}

          {/* PANEL — métricas + santuario, sin grid de gatos */}
          {activeTab === 'panel' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Panel Principal</h1>
                    <p className="text-xs text-gray-500">Gestión del hogar en tiempo real</p>
                  </div>
                </div>

                <UmapsTaskList
                  workOrders={workOrders}
                  members={effectiveMembers}
                  waterCutActive={waterCut.is_active}
                  onCompleteTask={handleCompleteTask}
                />

                <GamifiedDashboard
                  members={effectiveMembers}
                  streaks={mockStreaks}
                  preferences={mockPreferences}
                  workOrders={workOrders}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InventoryPanel inventory={inventory} />
                  <BountyMarketPanel
                    bounties={mockBounties}
                    members={effectiveMembers}
                    workOrders={workOrders}
                  />
                </div>

                <Sanctuary />
              </div>
            </div>
          )}

          {/* HOGAR — gatos activos + feed de tareas */}
          {activeTab === 'hogar' && (
            <div className="flex-1 min-h-0 flex flex-col bg-gray-50">
              <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2 flex-shrink-0">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  🐱 Gatos Activos ({cats.length})
                </h2>
                <CatStatusGrid cats={cats} litterOverdue={litterOverdue} />
              </div>
              <TaskFeed
                workOrders={workOrders}
                members={effectiveMembers}
                inventory={inventory}
                waterCutActive={waterCut.is_active}
                onCompleteTask={handleCompleteTask}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="flex-shrink-0 bg-white border-t border-gray-200 px-2">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {([
            { id: 'chat'  as Tab, icon: MessageSquare, label: 'Chat'  },
            { id: 'panel' as Tab, icon: BarChart3,     label: 'Panel' },
            { id: 'hogar' as Tab, icon: Home,          label: 'Hogar' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                sounds.play('click');
              }}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {activeTab === tab.id && <div className="w-1 h-1 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
