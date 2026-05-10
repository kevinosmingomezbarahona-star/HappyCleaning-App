import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  Droplets,
  Package,
  AlertTriangle,
  Wind,
} from 'lucide-react';
import type { ChatMessage, HouseholdMember, WorkOrder, Cat, ProductInventory } from '../types';
import { getStockLevel } from '../lib/inventory';
import { WATER_DEPENDENT_CATEGORIES } from '../data/mockData';

interface ChatAgentProps {
  members: HouseholdMember[];
  workOrders: WorkOrder[];
  cats: Cat[];
  inventory: ProductInventory[];
  waterCutActive: boolean;
  litterOverdue: boolean;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
}

function isLitterOverdue(cats: Cat[]): boolean {
  return cats.some((c) => {
    if (!c.last_litter_cleaned) return true;
    const hours = (Date.now() - new Date(c.last_litter_cleaned).getTime()) / 3600000;
    return hours >= 12;
  });
}

// ─── Household Knowledge Base (System Prompt) ──────────────────────────────
const HOUSEHOLD_KB = {
  family: ['Ninive', 'Osmin', 'Kevin', 'Marilyn', 'Mirza'],
  rules: {
    platos: 'Lavar platos: Siempre con agua hirviendo si hay grasa o mal olor. Limpiar orillas del fregadero con cepillo de dientes viejo.',
    banos: 'Baños: Restregar inodoro por dentro y por fuera, paredes y piso con detergente. Sin amoníaco ni cloro cerca de los gatos.',
    areneros: 'Areneros: Limpieza obligatoria cada 12 horas para evitar amoníaco volátil. PROHIBIDO el cloro. Solo Limpiador Enzimático.',
  },
  persona: 'Mayordomo Experto del hogar de la familia. Hablas con autoridad, calidez y orgullo. Cada tarea completada es un acto heroico que protege a la familia y a los 9 gatos.',
} as const;

function generateBotMessages(
  members: HouseholdMember[],
  workOrders: WorkOrder[],
  cats: Cat[],
  inventory: ProductInventory[],
  waterCutActive: boolean
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const now = new Date();
  const overdue = isLitterOverdue(cats);
  const memberNames = members.map((m) => m.name);
  const greeting = memberNames.length > 0 ? memberNames[0] : 'familia';

  messages.push({
    id: 'welcome',
    sender: 'bot',
    text: `Buenos días, ${greeting}. Soy HomeForce, el Mayordomo de este hogar. Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}. Cada tarea que completemos hoy protege a nuestra familia y a nuestros 9 gatos. ¡Hagamos historia!`,
    timestamp: now,
  });

  // UMAPS emergency - highest priority
  if (waterCutActive) {
    const blockedTasks = workOrders.filter(
      (w) => w.status === 'pending' && WATER_DEPENDENT_CATEGORIES.includes(w.category)
    );
    const dryTasks = workOrders.filter(
      (w) => w.status === 'pending' && !WATER_DEPENDENT_CATEGORIES.includes(w.category)
    );
    messages.push({
      id: 'water-emergency',
      sender: 'bot',
      text: `⚡ Protocolo UMAPS activado (5:00 AM – 5:00 PM). ${blockedTasks.length} tarea${blockedTasks.length > 1 ? 's' : ''} bloqueada${blockedTasks.length > 1 ? 's' : ''} por consumo hídrico. Pero no nos detenemos: ${dryTasks.length} misión${dryTasks.length > 1 ? 'es' : ''} de limpieza en seco esperan guerreros valientes.`,
      timestamp: new Date(now.getTime() + 1000),
      actions: [
        { label: 'Ver misiones secas', action: 'view_dry_tasks', variant: 'primary' },
      ],
    });
  }

  // Ammonia alert - critical priority
  if (overdue) {
    const overdueNames = cats
      .filter((c) => {
        if (!c.last_litter_cleaned) return true;
        return (Date.now() - new Date(c.last_litter_cleaned).getTime()) / 3600000 >= 12;
      })
      .map((c) => c.name);

    messages.push({
      id: 'ammonia-alert',
      sender: 'bot',
      text: `🚨 ALERTA CRÍTICA: Los areneros de ${overdueNames.join(', ')} llevan más de 12 horas sin limpieza. El amoníaco volátil está poniendo en riesgo su salud respiratoria. ${HOUSEHOLD_KB.rules.areneros}. ¡Actúa ahora, tú eres su protector!`,
      timestamp: new Date(now.getTime() + 2000),
      actions: [
        { label: '🛡️ Proteger areneros', action: 'complete_litter', variant: 'danger' },
      ],
    });
  } else {
    const sadCats = cats.filter((c) => c.mood === 'sad');
    if (sadCats.length > 0) {
      messages.push({
        id: 'cats-alert',
        sender: 'bot',
        text: `${sadCats.map((c) => c.name).join(', ')} ${sadCats.length > 1 ? 'necesitan' : 'necesita'} tu atención. Un arenero limpio cambia su día. Recuerda: ${HOUSEHOLD_KB.rules.areneros}`,
        timestamp: new Date(now.getTime() + 2000),
        actions: [
          { label: '🛡️ Limpiar areneros', action: 'complete_litter', variant: 'danger' },
        ],
      });
    }
  }

  const pendingTasks = workOrders.filter((w) => w.status === 'pending');
  if (pendingTasks.length > 0 && !waterCutActive) {
    const highPriority = pendingTasks.filter((w) => w.priority === 'high' || w.priority === 'critical');
    messages.push({
      id: 'tasks',
      sender: 'bot',
      text: `Tienes ${pendingTasks.length} misiones pendientes${highPriority.length > 0 ? ` (${highPriority.length} de alto impacto)` : ''}. La más urgente: "${highPriority[0]?.title || pendingTasks[0].title}". Cada tarea completada es un paso hacia un hogar impecable para Ninive, Osmin, Kevin, Marilyn y Mirza.`,
      timestamp: new Date(now.getTime() + 3000),
      actions: [
        { label: '⚔️ Ver misiones', action: 'view_tasks', variant: 'primary' },
        { label: '⚖️ Distribuir justo', action: 'fair_divide', variant: 'secondary' },
      ],
    });
  }

  const criticalItems = inventory.filter((i) => getStockLevel(i) === 'critical');
  const lowItems = inventory.filter((i) => getStockLevel(i) === 'low');
  if (criticalItems.length > 0 || lowItems.length > 0) {
    const items = [...criticalItems, ...lowItems];
    messages.push({
      id: 'inventory-alert',
      sender: 'bot',
      text: `📦 Suministros bajos: ${items.map((i) => `${i.name} (${i.current_stock} ${i.unit})`).join(', ')}. Un hogar preparado es un hogar fuerte.`,
      timestamp: new Date(now.getTime() + 4000),
      actions: [
        { label: 'Ver inventario', action: 'view_inventory', variant: 'secondary' },
      ],
    });
  }

  const topStreakMember = members.reduce((top, m) => {
    const xp = m.xp_points;
    return xp > top.xp ? { member: m, xp } : top;
  }, { member: members[0], xp: 0 });

  messages.push({
    id: 'streak',
    sender: 'bot',
    text: `🏆 ${topStreakMember.member.name} lidera con ${topStreakMember.member.xp_points} XP. ¡Eso es compromiso real! El hogar entero se beneficia de tu esfuerzo.`,
    timestamp: new Date(now.getTime() + 5000),
  });

  return messages;
}

function getActionIcon(action: string) {
  if (action.includes('litter') || action.includes('clean')) return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (action.includes('inventory')) return <Package className="w-3.5 h-3.5" />;
  if (action.includes('water') || action.includes('umaps')) return <Droplets className="w-3.5 h-3.5" />;
  if (action.includes('dry')) return <Wind className="w-3.5 h-3.5" />;
  if (action.includes('fair') || action.includes('divide')) return <Sparkles className="w-3.5 h-3.5" />;
  return null;
}

export function ChatAgent({
  members,
  workOrders,
  cats,
  inventory,
  waterCutActive,
  litterOverdue,
  onAction,
}: ChatAgentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initial = generateBotMessages(members, workOrders, cats, inventory, waterCutActive);
    setMessages(initial);
  }, [members, workOrders, cats, inventory, waterCutActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(input.trim(), workOrders, members, waterCutActive);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleAction = (action: string) => {
    const actionMsg: ChatMessage = {
      id: `action-${Date.now()}`,
      sender: 'user',
      text: action.replace(/_/g, ' '),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMsg]);
    onAction(action);

    setTimeout(() => {
      const response = generateActionResponse(action, workOrders, members, waterCutActive);
      setMessages((prev) => [...prev, response]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-800">HomeForce</h2>
          <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
            Mayordomo Experto — En línea
          </p>
        </div>
        {litterOverdue && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-semibold text-red-600">Amoníaco</span>
          </div>
        )}
        {waterCutActive && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <Droplets className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold text-amber-600">UMAPS</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                  : msg.id === 'water-emergency'
                    ? 'bg-amber-50 text-amber-900 rounded-2xl rounded-bl-md shadow-sm border border-amber-200'
                    : msg.id === 'ammonia-alert'
                      ? 'bg-red-50 text-red-900 rounded-2xl rounded-bl-md shadow-sm border border-red-200'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
              } px-3.5 py-2.5`}
            >
              {msg.sender === 'bot' && (
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.id === 'water-emergency' ? (
                    <Droplets className="w-3 h-3 text-amber-500" />
                  ) : msg.id === 'ammonia-alert' ? (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-blue-500" />
                  )}
                  <span className={`text-[10px] font-semibold ${
                    msg.id === 'water-emergency' ? 'text-amber-600' :
                    msg.id === 'ammonia-alert' ? 'text-red-600' :
                    'text-blue-500'
                  }`}>HomeForce</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleAction(action.action)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200 ${
                        action.variant === 'primary'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : action.variant === 'danger'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getActionIcon(action.action)}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <span
                className={`text-[9px] mt-1 block ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-gray-300'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function generateResponse(
  input: string,
  workOrders: WorkOrder[],
  members: HouseholdMember[],
  waterCutActive: boolean
): ChatMessage {
  const lower = input.toLowerCase();
  const pending = workOrders.filter((w) => w.status === 'pending');

  // Water / UMAPS
  if (lower.includes('umaps') || lower.includes('agua') || lower.includes('corte')) {
    if (waterCutActive) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'bot',
        text: '⚡ Protocolo UMAPS activo (5:00 AM – 5:00 PM). Las tareas hídricas están bloqueadas, pero un verdadero guardián del hogar no se detiene. Prioriza misiones en seco: rociar enzimático, barrer y limpiar areneros. ¡Adelante!',
        timestamp: new Date(),
        actions: [
          { label: 'Ver misiones secas', action: 'view_dry_tasks', variant: 'primary' },
        ],
      };
    }
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: '✅ No hay corte de agua activo. Todas las misiones están disponibles. ¡Es hora de dar lo mejor por el hogar de Ninive, Osmin, Kevin, Marilyn y Mirza!',
      timestamp: new Date(),
    };
  }

  // Tasks
  if (lower.includes('tarea') || lower.includes('pendiente') || lower.includes('misión') || lower.includes('mision')) {
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: `Hay ${pending.length} misiones esperando héroes: ${pending.slice(0, 3).map((t) => `"${t.title}"`).join(', ')}${pending.length > 3 ? '...' : ''}. Cada una es una oportunidad de ganar XP y proteger a tu familia. ¿Quién acepta el reto?`,
      timestamp: new Date(),
      actions: [
        { label: '⚔️ Ver todas', action: 'view_tasks', variant: 'primary' },
        { label: '⚖️ Distribuir', action: 'fair_divide', variant: 'secondary' },
      ],
    };
  }

  // Platos / trastes
  if (lower.includes('plato') || lower.includes('traste') || lower.includes('fregadero') || lower.includes('lavar')) {
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: `📋 Protocolo de Cocina: ${HOUSEHOLD_KB.rules.platos}. Un fregadero brillante es la primera señal de un hogar bien cuidado. ¡Tú puedes con esto!`,
      timestamp: new Date(),
      actions: [
        { label: '⚔️ Ver misiones', action: 'view_tasks', variant: 'primary' },
      ],
    };
  }

  // Baños
  if (lower.includes('baño') || lower.includes('inodoro') || lower.includes('sanitario')) {
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: `🚿 Protocolo de Baños: ${HOUSEHOLD_KB.rules.banos}. Un baño impecable refleja el orgullo de esta familia. ¡Manos a la obra!`,
      timestamp: new Date(),
      actions: [
        { label: '⚔️ Ver misiones', action: 'view_tasks', variant: 'primary' },
      ],
    };
  }

  // Areneros / gatos / amoníaco
  if (lower.includes('gato') || lower.includes('arenero') || lower.includes('amoniaco') || lower.includes('amoníaco')) {
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: `🐱 Protocolo Felino: ${HOUSEHOLD_KB.rules.areneros}. Los 9 gatos (Tom, Jerry, Oliver, Ricky, Felix, Topo, Brittney, Daisy y Brisa) dependen de ti. Eres su guardián. ¡Protégelos!`,
      timestamp: new Date(),
      actions: [
        { label: '🛡️ Proteger areneros', action: 'complete_litter', variant: 'danger' },
      ],
    };
  }

  // Inventory
  if (lower.includes('inventario') || lower.includes('stock') || lower.includes('suministro')) {
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: '📦 Un buen mayordomo siempre vigila los suministros. Revisemos los niveles de inventario para que nada falte cuando más se necesite.',
      timestamp: new Date(),
      actions: [
        { label: 'Ver inventario', action: 'view_inventory', variant: 'secondary' },
      ],
    };
  }

  // XP / levels
  if (lower.includes('nivel') || lower.includes('xp') || lower.includes('puntos')) {
    const top = members.reduce((a, b) => (a.xp_points > b.xp_points ? a : b));
    const bottom = members.reduce((a, b) => (a.xp_points < b.xp_points ? a : b));
    return {
      id: `resp-${Date.now()}`,
      sender: 'bot',
      text: `🏆 ${top.name} lidera con ${top.xp_points} XP (Nivel ${top.level}). ¡Ejemplo de compromiso! ${bottom.name} va con ${bottom.xp_points} XP — ¡una gran oportunidad para subir y demostrar de qué está hecho!`,
      timestamp: new Date(),
    };
  }

  // Family members
  if (HOUSEHOLD_KB.family.some((name) => lower.includes(name.toLowerCase()))) {
    const matchedName = HOUSEHOLD_KB.family.find((name) => lower.includes(name.toLowerCase())) || '';
    const member = members.find((m) => m.name.toLowerCase() === matchedName.toLowerCase());
    if (member) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'bot',
        text: `${member.name} tiene ${member.xp_points} XP y ${member.home_coins} Monedas del Hogar (Nivel ${member.level}). ${member.role === 'admin' ? 'Como administradora, su liderazgo guía al equipo.' : 'Su esfuerzo fortalece a todo el hogar.'} ¡Sigue así!`,
        timestamp: new Date(),
      };
    }
  }

  // Default fallback
  return {
    id: `resp-${Date.now()}`,
    sender: 'bot',
    text: 'Como Mayordomo de este hogar, puedo orientarte sobre misiones, areneros, baños, cocina, inventario o distribución justa. ¿En qué puedo servir a la familia?',
    timestamp: new Date(),
    actions: [
      { label: '⚔️ Misiones', action: 'view_tasks', variant: 'primary' },
      { label: '📦 Inventario', action: 'view_inventory', variant: 'secondary' },
      { label: '⚖️ Distribuir justo', action: 'fair_divide', variant: 'secondary' },
    ],
  };
}

function generateActionResponse(
  action: string,
  workOrders: WorkOrder[],
  _members: HouseholdMember[],
  waterCutActive: boolean
): ChatMessage {
  switch (action) {
    case 'complete_litter':
      return {
        id: `action-resp-${Date.now()}`,
        sender: 'bot',
        text: '🛡️ ¡Areneros protegidos! Se dedujeron 0.5 kg de Arena de Tofu y 0.1 L de Limpiador Enzimático. +25 XP, +10 🪙. Los 9 gatos respiran aire limpio gracias a tu valentía. ¡Eso es ser un guardián!',
        timestamp: new Date(),
      };
    case 'fair_divide':
      return {
        id: `action-resp-${Date.now()}`,
        sender: 'bot',
        text: '⚖️ Misiones redistribuidas con el algoritmo de División Justa (EF1). La carga está equilibrada según las fortalezas de Ninive, Osmin, Kevin, Marilyn y Mirza. ¡Juntos somos invencibles!',
        timestamp: new Date(),
      };
    case 'view_tasks':
      return {
        id: `action-resp-${Date.now()}`,
        sender: 'bot',
        text: `⚔️ Misiones activas: ${workOrders.filter((w) => w.status === 'pending').map((t) => `"${t.title}"`).join(', ')}. Cada misión completada nos acerca a un hogar perfecto. ¿Quién toma el reto primero?`,
        timestamp: new Date(),
        actions: [
          { label: '⚖️ Distribuir justo', action: 'fair_divide', variant: 'primary' },
        ],
      };
    case 'view_dry_tasks':
      return {
        id: `action-resp-${Date.now()}`,
        sender: 'bot',
        text: waterCutActive
          ? '💨 Misiones de limpieza en seco: Rociar enzimático, Barrer pasillo, Limpiar areneros, Sacar basura. ¡No necesitamos agua para ser héroes!'
          : '✅ No hay corte de agua activo. Todas las misiones están disponibles. ¡Adelante!',
        timestamp: new Date(),
      };
    case 'view_inventory':
      return {
        id: `action-resp-${Date.now()}`,
        sender: 'bot',
        text: '📦 Revisa el panel de inventario. Los productos críticos están marcados en rojo. Un hogar preparado nunca es tomado por sorpresa.',
        timestamp: new Date(),
      };
    default:
      return {
        id: `action-resp-${Date.now()}`,
        sender: 'bot',
        text: '✅ Acción registrada. ¿En qué más puedo servir a la familia?',
        timestamp: new Date(),
      };
  }
}
