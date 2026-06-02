import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onMenuClick }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="bg-brand-yellow sticky top-0 z-50 shadow-md">
      <div className="px-4 py-3">
        {/* Top bar with profile and menu */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-brand-yellow font-bold">
            T
          </div>
          <div className="flex-1" />
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-brand-accent rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-brand-blue" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm">
            <input
              type="text"
              placeholder="Buscar profissionais..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 outline-none text-sm text-brand-blue placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-brand-blue flex-shrink-0" />
          </div>
          <button className="p-2 text-brand-blue hover:bg-brand-accent rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Location bar */}
        <div className="flex items-center gap-2 mt-3 text-sm text-brand-blue font-medium">
          <div className="w-5 h-5">📍</div>
          <span className="truncate">Rua Terezinha Andrade Godoy 172</span>
          <span className="text-brand-blue">&gt;</span>
        </div>
      </div>
    </header>
  );
};
