import React from 'react';
import { PercentCircle, Gift, Store, ShoppingCart, Heart, TrendingUp } from 'lucide-react';

interface QuickAccessItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

interface QuickAccessIconsProps {
  items?: QuickAccessItem[];
}

const defaultItems: QuickAccessItem[] = [
  {
    id: 'offers',
    label: 'Ofertas',
    icon: <PercentCircle className="w-8 h-8" />,
    color: 'bg-yellow-400',
  },
  {
    id: 'coupons',
    label: 'Cupons',
    icon: <Gift className="w-8 h-8" />,
    color: 'bg-blue-400',
  },
  {
    id: 'official',
    label: 'Oficiais',
    icon: <Store className="w-8 h-8" />,
    color: 'bg-blue-300',
  },
  {
    id: 'cart',
    label: 'Carrinho',
    icon: <ShoppingCart className="w-8 h-8" />,
    color: 'bg-orange-300',
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-orange-400',
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'bg-gray-400',
  },
];

export const QuickAccessIcons: React.FC<QuickAccessIconsProps> = ({
  items = defaultItems,
}) => {
  return (
    <div className="mx-3 my-4">
      <div className="grid grid-cols-6 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:scale-105 transition-transform"
          >
            <div className={`${item.color} text-white rounded-full p-3 flex items-center justify-center border-2 border-brand-dark`}>
              {item.icon}
            </div>
            <span className="text-xs font-medium text-brand-blue text-center line-clamp-2">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
