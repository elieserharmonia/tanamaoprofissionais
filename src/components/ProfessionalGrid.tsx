import React from 'react';
import { ProfessionalCard } from './ProfessionalCard';

interface Professional {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  location?: string;
}

interface ProfessionalGridProps {
  professionals: Professional[];
  onProfessionalClick: (id: string) => void;
  onFavoriteClick: (id: string) => void;
  favorites?: string[];
  columns?: number;
}

export const ProfessionalGrid: React.FC<ProfessionalGridProps> = ({
  professionals,
  onProfessionalClick,
  onFavoriteClick,
  favorites = [],
  columns = 2,
}) => {
  return (
    <div className="px-3 pb-24">
      <div
        className={`grid gap-3`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {professionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            {...professional}
            isFavorite={favorites.includes(professional.id)}
            onFavoriteClick={() => onFavoriteClick(professional.id)}
            onClick={() => onProfessionalClick(professional.id)}
          />
        ))}
      </div>

      {professionals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-center">
            Nenhum profissional encontrado
          </p>
        </div>
      )}
    </div>
  );
};
