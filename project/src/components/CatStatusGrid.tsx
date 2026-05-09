import { AlertTriangle } from 'lucide-react';
import type { Cat } from '../types';

interface CatStatusGridProps {
  cats: Cat[];
  litterOverdue: boolean;
}

function getCatMoodStyle(mood: Cat['mood'], litterOverdue: boolean) {
  if (litterOverdue && mood !== 'happy') {
    return {
      bg: 'bg-red-50 border-red-300',
      text: 'text-red-700',
      label: 'Alerta Amoníaco',
      animation: 'animate-wiggle',
    };
  }
  switch (mood) {
    case 'happy':
      return {
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        label: 'Feliz',
        animation: '',
      };
    case 'neutral':
      return {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        label: 'Neutral',
        animation: '',
      };
    case 'sad':
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        label: 'Triste',
        animation: 'animate-wiggle',
      };
  }
}

function getTimeSinceCleaned(lastCleaned: string | null): string {
  if (!lastCleaned) return 'Nunca';
  const hours = Math.floor(
    (Date.now() - new Date(lastCleaned).getTime()) / 3600000
  );
  if (hours < 1) return 'Hace <1h';
  return `Hace ${hours}h`;
}

function getCatGenderClass(name: string): string {
  const females = ['Brittney', 'Daisy', 'Brisa'];
  return females.includes(name) ? 'ring-pink-300' : 'ring-blue-300';
}

export function CatStatusGrid({ cats, litterOverdue }: CatStatusGridProps) {
  const sadCats = cats.filter((c) => c.mood === 'sad');
  const neutralCats = cats.filter((c) => c.mood === 'neutral');
  const alertCats = litterOverdue ? cats.filter((c) => c.mood !== 'happy') : [];

  return (
    <div>
      {/* Ammonia Alert Banner */}
      {litterOverdue && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-red-700">
              Riesgo de amoníaco volátil - Areneros vencidos
            </p>
            <p className="text-[10px] text-red-500">
              {alertCats.length} gato{alertCats.length > 1 ? 's' : ''} en alerta. Limpiar areneros cada 12h para prevenir respiración de amoníaco.
            </p>
          </div>
        </div>
      )}

      {/* Status Pills */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {sadCats.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            {sadCats.length} triste{sadCats.length > 1 ? 's' : ''}
          </span>
        )}
        {neutralCats.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {neutralCats.length} neutral{neutralCats.length > 1 ? 'es' : ''}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          6 machos
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600">
          3 hembras
        </span>
      </div>

      {/* Cat Grid */}
      <div className="grid grid-cols-5 gap-2">
        {cats.map((cat) => {
          const style = getCatMoodStyle(cat.mood, litterOverdue);
          const isFemale = ['Brittney', 'Daisy', 'Brisa'].includes(cat.name);

          return (
            <div
              key={cat.id}
              className={`relative flex flex-col items-center p-2 rounded-xl border ${style.bg} transition-all duration-300 hover:scale-105`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ring-2 ${getCatGenderClass(cat.name)} ${style.animation} ${cat.mood === 'sad' || (litterOverdue && cat.mood !== 'happy') ? 'grayscale-[30%]' : ''}`}
              >
                {isFemale ? '🐈' : '🐱'}
              </div>
              <span className={`text-[10px] font-semibold mt-1 ${style.text} truncate w-full text-center`}>
                {cat.name}
              </span>
              <span className="text-[9px] text-gray-400">
                {getTimeSinceCleaned(cat.last_litter_cleaned)}
              </span>
              {(cat.mood === 'sad' || (litterOverdue && cat.mood !== 'happy')) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
