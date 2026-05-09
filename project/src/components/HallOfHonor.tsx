import { Heart } from 'lucide-react';

interface FallenPet {
  name: string;
  species: 'cat' | 'dog';
  year: number;
  avatarUrl?: string;
}

const FALLEN_PETS: FallenPet[] = [
  { name: 'Dayson', species: 'cat', year: 2024 },
  { name: 'Harry', species: 'cat', year: 2024 },
  { name: 'Toby', species: 'dog', year: 2024 },
];

function PetAvatar({ pet }: { pet: FallenPet }) {
  const emoji = pet.species === 'dog' ? '🐕' : '🐱';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar circle */}
      <div
        className="
          w-16 h-16 rounded-full border-2 border-white/20
          flex items-center justify-center text-2xl
          bg-gray-700/60 shadow-inner
          grayscale
        "
        aria-label={pet.name}
      >
        {pet.avatarUrl ? (
          <img
            src={pet.avatarUrl}
            alt={pet.name}
            className="w-full h-full object-cover rounded-full grayscale"
          />
        ) : (
          <span style={{ filter: 'grayscale(1)' }}>{emoji}</span>
        )}
      </div>

      {/* Name & year */}
      <div className="text-center">
        <p className="text-white/80 text-xs font-semibold tracking-wide">{pet.name}</p>
        <p className="text-white/35 text-[10px]">{pet.year}</p>
      </div>
    </div>
  );
}

export function HallOfHonor() {
  return (
    <section
      aria-label="Pasillo de Honor — Mascotas recordadas"
      className="
        mt-2 mx-0 rounded-2xl overflow-hidden
        border border-white/10
        bg-gradient-to-b from-gray-900/80 to-gray-950/90
        backdrop-blur-sm shadow-lg
      "
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 pt-5 pb-3 px-4">
        <div className="h-px flex-1 bg-white/10 rounded-full" />
        <Heart className="w-4 h-4 text-rose-400/70 flex-shrink-0" />
        <p
          className="text-white/50 text-[11px] font-light tracking-[0.2em] uppercase select-none flex-shrink-0"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          En su memoria
        </p>
        <Heart className="w-4 h-4 text-rose-400/70 flex-shrink-0" />
        <div className="h-px flex-1 bg-white/10 rounded-full" />
      </div>

      {/* Pet avatars row */}
      <div className="flex items-start justify-center gap-8 pb-5 px-4">
        {FALLEN_PETS.map((pet) => (
          <PetAvatar key={pet.name} pet={pet} />
        ))}
      </div>

      {/* Epitaph */}
      <div className="border-t border-white/5 py-3 px-4 text-center">
        <p
          className="text-white/25 text-[10px] italic tracking-wider"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Compañeros fieles. Siempre en nuestros corazones.
        </p>
      </div>
    </section>
  );
}
