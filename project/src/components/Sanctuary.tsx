import { Heart, Moon } from 'lucide-react';

interface FallenPet {
  name: string;
  species: 'cat' | 'dog';
  year: number;
  epitaph: string;
  avatarUrl?: string;
}

const FALLEN_PETS: FallenPet[] = [
  {
    name: 'Dayson',
    species: 'cat',
    year: 2024,
    epitaph: 'El más valiente de todos. Tu ronroneo aún resuena.',
  },
  {
    name: 'Harry',
    species: 'cat',
    year: 2024,
    epitaph: 'Compañero silencioso de las noches largas.',
  },
  {
    name: 'Toby',
    species: 'dog',
    year: 2024,
    epitaph: 'Fiel guardián de este hogar. Siempre en guardia.',
  },
];

function PetCard({ pet }: { pet: FallenPet }) {
  const emoji = pet.species === 'dog' ? '🐕' : '🐱';

  return (
    <div
      className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl
                 bg-white/3 border border-white/8
                 hover:bg-white/6 transition-colors duration-300
                 min-w-0"
    >
      {/* Avatar */}
      <div
        className="relative w-14 h-14 rounded-full
                   bg-gradient-to-br from-gray-700 to-gray-800
                   border-2 border-white/10 shadow-inner
                   flex items-center justify-center text-2xl
                   overflow-hidden grayscale"
      >
        {pet.avatarUrl ? (
          <img
            src={pet.avatarUrl}
            alt={pet.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span style={{ filter: 'grayscale(1) brightness(0.8)' }}>{emoji}</span>
        )}
        {/* Candlelight shimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="text-white/75 text-xs font-semibold tracking-wide">{pet.name}</p>
        <p className="text-white/30 text-[10px] mt-0.5">{pet.year}</p>
      </div>

      {/* Epitaph */}
      <p
        className="text-white/30 text-[9px] italic text-center leading-relaxed px-1"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {pet.epitaph}
      </p>
    </div>
  );
}

export function Sanctuary() {
  return (
    <section
      aria-label="Santuario del Recuerdo — Mascotas recordadas"
      className="
        mt-2 rounded-2xl overflow-hidden
        border border-white/8
        bg-gradient-to-b from-gray-900/70 to-gray-950/85
        backdrop-blur-sm shadow-xl
      "
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-px flex-1 bg-white/8 rounded-full" />
          <Moon className="w-3.5 h-3.5 text-indigo-400/60 flex-shrink-0" />
          <p
            className="text-white/45 text-[11px] font-light tracking-[0.22em] uppercase select-none flex-shrink-0"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Santuario del Recuerdo
          </p>
          <Heart className="w-3.5 h-3.5 text-rose-400/60 flex-shrink-0" />
          <div className="h-px flex-1 bg-white/8 rounded-full" />
        </div>
        <p
          className="text-center text-white/20 text-[10px] tracking-wider"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Dayson · Harry · Toby — Compañeros fieles. Siempre en nuestros corazones.
        </p>
      </div>

      {/* Pet cards grid */}
      <div className="grid grid-cols-3 gap-2 px-3 pb-4">
        {FALLEN_PETS.map((pet) => (
          <PetCard key={pet.name} pet={pet} />
        ))}
      </div>

      {/* Footer quote */}
      <div className="border-t border-white/5 py-3 px-4 text-center">
        <p
          className="text-white/20 text-[9px] italic tracking-wider"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          "El amor que diste nunca se olvida."
        </p>
      </div>
    </section>
  );
}
