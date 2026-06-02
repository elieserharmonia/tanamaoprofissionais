import React from 'react';
import { Heart, MapPin, Star } from 'lucide-react';

interface ProfessionalCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
  badge?: string;
  location?: string;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  id,
  name,
  category,
  rating,
  reviews,
  image,
  isFavorite = false,
  onFavoriteClick,
  onClick,
  badge,
  location,
}) => {
  return (
    <div
      className="bg-white rounded-lg border-2 border-brand-dark overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer retro-shadow"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-brand-blue text-brand-yellow px-3 py-1 rounded-full font-bold text-xs border-2 border-brand-dark">
            {badge}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
          className="absolute top-2 right-2 bg-white rounded-full p-2 border-2 border-brand-dark shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-brand-blue'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-brand-blue text-sm line-clamp-2">
          {name}
        </h3>

        <p className="text-xs text-gray-600 mt-1">
          {category}
        </p>

        {location && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-brand-blue">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-600">
            ({reviews})
          </span>
        </div>
      </div>
    </div>
  );
};
