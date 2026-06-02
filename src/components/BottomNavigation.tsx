import React from 'react';
import { Home, Grid, ShoppingCart, Play, Menu as MenuIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavigationProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { id: 'home', label: 'Início', icon: <Home className="w-5 h-5" /> },
  { id: 'categories', label: 'Categorias', icon: <Grid className="w-5 h-5" /> },
  { id: 'cart', label: 'Carrinho', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'videos', label: 'Vídeos', icon: <Play className="w-5 h-5" /> },
  { id: 'menu', label: 'Mais', icon: <MenuIcon className="w-5 h-5" /> },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeItem,
  onItemClick,
  items = defaultItems,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-3 border-brand-dark shadow-lg">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              activeItem === item.id
                ? 'text-brand-blue'
                : 'text-gray-600 hover:text-brand-yellow'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
