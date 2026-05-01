import { useState, useRef } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Package,
  ChevronLeft,
  Loader2,
  ImageIcon,
  Star,
  Coins,
} from 'lucide-react';
import type { WorkOrder, ProductInventory } from '../types';
import { uploadTaskPhoto, completeTaskWithPhotos } from '../lib/storage';

// ─── Knowledge Base: task-specific instructions & alerts ───────────────────
interface KB {
  warning?: string;
  supplies: string[];
  tips: string[];
}

function getKB(task: WorkOrder, inventory: ProductInventory[]): KB {
  const lowerTitle = task.title.toLowerCase();

  // Litter tasks
  if (task.category === 'litter' || lowerTitle.includes('arenero')) {
    const tofu = inventory.find((i) => i.name.toLowerCase().includes('tofu'));
    return {
      warning: '⚠️ PROHIBIDO: Cloro y Amoníaco. Usan SOLO Limpiador Enzimático cerca de los gatos.',
      supplies: ['Palita para heces', 'Bolsa de basura', 'Arena de Tofu', 'Limpiador Enzimático'],
      tips: [
        'Sacar TODAS las heces con la palita.',
        'Si el nivel de arena es bajo, agregar Arena de Tofu fresca.',
        `Stock actual de Arena de Tofu: ${tofu ? tofu.current_stock + ' ' + tofu.unit : 'sin datos'}.`,
      ],
    };
  }

  // Dish washing
  if (lowerTitle.includes('trastr') || lowerTitle.includes('plato') || lowerTitle.includes('lavar trastr')) {
    return {
      warning: '🌡️ Usar agua hirviendo si hay manteca o mal olor.',
      supplies: ['Esponja', 'Jabón de platos', 'Cepillo de dientes (orillas)'],
      tips: [
        'Limpiar alrededor del fregadero con esponja.',
        'Retirar restos acumulados en las orillas con el cepillo.',
        'Dejar brillante y seco.',
      ],
    };
  }

  // Bathroom
  if (task.category === 'bathroom' || lowerTitle.includes('baño')) {
    return {
      warning: '⚠️ Usar detergente SIN amoníaco. Prohibido cloro cerca de los gatos.',
      supplies: ['Cepillo de fregar', 'Detergente', 'Limpiavidrios', 'Toallas limpias'],
      tips: [
        'Restregar piso y paredes con cepillo y detergente.',
        'Restregar inodoro por dentro y por fuera.',
        'Limpiar espejo con limpiavidrios.',
        'Cambiar toallas si aplica.',
      ],
    };
  }

  // Cat bathing
  if (lowerTitle.includes('baño de gatos') || lowerTitle.includes('gato')) {
    return {
      warning: '🐱 Secar completamente. El frío causa hipotermia en gatos.',
      supplies: ['Champú suave para gatos', 'Toalla grande', 'Secadora (opcional)'],
      tips: [
        'Usar champú EXCLUSIVO para gatos, no para humanos.',
        'Enjuagar completamente sin dejar residuos.',
        'Secar con toalla y revisar piel y orejas.',
      ],
    };
  }

  // Mopping / floors
  if (lowerTitle.includes('trapear') || lowerTitle.includes('piso')) {
    return {
      supplies: ['Trapeador', 'Desinfectante diluido', 'Balde'],
      tips: [
        'Usar agua caliente con desinfectante diluido.',
        'Comenzar desde el fondo hacia la salida.',
        'Dejar secar completamente antes de pisar.',
      ],
    };
  }

  // Fridge
  if (lowerTitle.includes('refrigerador')) {
    return {
      supplies: ['Agua tibia', 'Bicarbonato de sodio', 'Trapo limpio'],
      tips: [
        'Sacar TODO el contenido primero.',
        'Limpiar estantes con agua tibia y bicarbonato.',
        'Revisar fechas de vencimiento.',
        'Reorganizar y dejar pulcro.',
      ],
    };
  }

  // Enzyme spray
  if (lowerTitle.includes('enzimático') || lowerTitle.includes('enzim')) {
    return {
      warning: '⏱️ Dejar actuar 5 minutos antes de limpiar.',
      supplies: ['Limpiador Enzimático', 'Paño limpio'],
      tips: [
        'Aplicar en superficies que no puedan mojarse.',
        'Dejar actuar 5 minutos.',
        'Limpiar con paño limpio.',
      ],
    };
  }

  // Generic fallback
  return {
    supplies: [],
    tips: [task.description || 'Sigue las instrucciones de la tarea.'],
  };
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface TaskExecutionModalProps {
  task: WorkOrder;
  inventory: ProductInventory[];
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

type Step = 1 | 2 | 3;

// ─── Photo upload button component ──────────────────────────────────────────
function PhotoUploadArea({
  phase,
  previewUrl,
  uploading,
  onFileSelected,
}: {
  phase: 'before' | 'after';
  previewUrl: string | null;
  uploading: boolean;
  onFileSelected: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        id={`photo-input-${phase}`}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400">
          <img src={previewUrl} alt={`Foto ${phase}`} className="w-full h-52 object-cover" />
          <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Foto lista
          </div>
        </div>
      ) : (
        <button
          id={`photo-btn-${phase}`}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`
            w-full h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3
            transition-all duration-200 active:scale-[0.98]
            ${uploading
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <span className="text-sm font-medium text-blue-500">Subiendo foto…</span>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">
                  Tomar foto del {phase === 'before' ? '"Antes"' : '"Después"'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Toca para abrir la cámara</p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────
export function TaskExecutionModal({
  task,
  inventory,
  onClose,
  onComplete,
}: TaskExecutionModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  const kb = getKB(task, inventory);

  async function handlePhotoSelected(file: File, phase: 'before' | 'after') {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    if (phase === 'before') setBeforePreview(localUrl);
    else setAfterPreview(localUrl);

    setUploading(true);
    const remoteUrl = await uploadTaskPhoto(task.id, phase, file);
    setUploading(false);

    if (phase === 'before') setBeforeUrl(remoteUrl);
    else setAfterUrl(remoteUrl);
  }

  async function handleFinish() {
    setCompleting(true);
    await completeTaskWithPhotos(task.id, beforeUrl, afterUrl);
    setCompleting(false);
    setDone(true);
    setTimeout(() => {
      onComplete(task.id);
      onClose();
    }, 2200);
  }

  // Step indicators
  const steps = [
    { n: 1, label: 'Antes' },
    { n: 2, label: 'KB' },
    { n: 3, label: 'Después' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      {/* Modal card */}
      <div className="mt-auto bg-white rounded-t-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <button
            id="modal-back-btn"
            onClick={step > 1 ? () => setStep((s) => (s - 1) as Step) : onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {step > 1 ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <X className="w-5 h-5 text-gray-600" />}
          </button>
          <div className="text-center">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Ejecutando Tarea</p>
            <h2 className="text-sm font-bold text-gray-900 max-w-[180px] truncate">{task.title}</h2>
          </div>
          <button id="modal-close-btn" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center px-6 py-3 gap-2 flex-shrink-0">
          {steps.map((s, idx) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all
                ${step > s.n
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : step === s.n
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                }
              `}>
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-[10px] font-semibold ml-1 ${step >= s.n ? 'text-gray-700' : 'text-gray-300'}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > s.n ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">

          {/* ─── DONE celebration ─── */}
          {done && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">¡Tarea Completada!</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-amber-600 font-bold text-lg">
                  <Star className="w-5 h-5" /> +{task.xp_reward} XP
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-lg">
                  <Coins className="w-5 h-5" /> +{task.coin_reward} 🪙
                </div>
              </div>
              <p className="text-sm text-gray-400">Cerrando…</p>
            </div>
          )}

          {/* ─── STEP 1: Before photo ─── */}
          {!done && step === 1 && (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Foto del Estado Inicial</h3>
                <p className="text-sm text-gray-500 mt-1">Documenta el estado de la tarea <strong>antes</strong> de empezar.</p>
              </div>
              <PhotoUploadArea
                phase="before"
                previewUrl={beforePreview}
                uploading={uploading}
                onFileSelected={(f) => handlePhotoSelected(f, 'before')}
              />
              <button
                id="step1-continue-btn"
                disabled={!beforePreview || uploading}
                onClick={() => setStep(2)}
                className={`
                  w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-[0.98]
                  ${beforePreview && !uploading
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Continuar <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-gray-400">La foto es obligatoria para continuar</p>
            </div>
          )}

          {/* ─── STEP 2: KB — Instructions & supplies ─── */}
          {!done && step === 2 && (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Instrucciones y Suministros</h3>
                <p className="text-sm text-gray-500 mt-1">Lee con cuidado antes de continuar.</p>
              </div>

              {/* Safety warning */}
              {kb.warning && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-700">{kb.warning}</p>
                </div>
              )}

              {/* Supplies */}
              {kb.supplies.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">Suministros Necesarios</span>
                  </div>
                  {kb.supplies.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-amber-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Step-by-step tips */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                <span className="text-sm font-bold text-gray-800">Pasos a Seguir</span>
                {kb.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>

              <button
                id="step2-continue-btn"
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                Ya tengo todo, continuar <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── STEP 3: After photo ─── */}
          {!done && step === 3 && (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Foto del Resultado Final</h3>
                <p className="text-sm text-gray-500 mt-1">Demuestra que la tarea quedó <strong>completa y limpia</strong>.</p>
              </div>

              {/* Before thumbnail for comparison */}
              {beforePreview && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100">
                  <img src={beforePreview} alt="Antes" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Foto "Antes"</p>
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Registrada
                    </p>
                  </div>
                  <ImageIcon className="w-4 h-4 text-gray-300 ml-auto" />
                </div>
              )}

              <PhotoUploadArea
                phase="after"
                previewUrl={afterPreview}
                uploading={uploading}
                onFileSelected={(f) => handlePhotoSelected(f, 'after')}
              />

              <button
                id="step3-finish-btn"
                disabled={!afterPreview || uploading || completing}
                onClick={handleFinish}
                className={`
                  w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-[0.98]
                  ${afterPreview && !uploading && !completing
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {completing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Guardando…</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Marcar como Completada</>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 py-1">
                <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                  <Star className="w-4 h-4" /> +{task.xp_reward} XP
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  +{task.coin_reward} 🪙
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
