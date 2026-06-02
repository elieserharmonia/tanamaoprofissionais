import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  discount?: string;
  image?: string;
  gradient?: boolean;
  onAction?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  title,
  subtitle,
  discount,
  image,
  gradient = false,
  onAction,
}) => {
  return (
    <div
      className={`mx-3 my-3 rounded-lg overflow-hidden border-3 border-brand-dark shadow-md cursor-pointer transition-transform hover:scale-105 ${
        gradient
          ? 'bg-gradient-to-r from-brand-blue to-brand-dark'
          : 'bg-brand-yellow'
      }`}
      onClick={onAction}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${gradient ? 'text-brand-yellow' : 'text-brand-blue'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-sm mt-1 ${gradient ? 'text-brand-yellow' : 'text-brand-blue'}`}>
              {subtitle}
            </p>
          )}
          {discount && (
            <div className={`mt-2 inline-block px-2 py-1 rounded font-bold text-sm ${
              gradient ? 'bg-brand-yellow text-brand-blue' : 'bg-brand-blue text-brand-yellow'
            }`}>
              {discount}
            </div>
          )}
        </div>
        {image && (
          <img
            src={image}
            alt={title}
            className="w-20 h-20 object-cover rounded ml-3"
          />
        )}
        {!image && (
          <ChevronRight className={`w-6 h-6 ${gradient ? 'text-brand-yellow' : 'text-brand-blue'}`} />
        )}
      </div>
    </div>
  );
};
