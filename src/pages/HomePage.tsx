import React, { useState } from 'react';
import { Header, CategoryTabs, PromoBanner, QuickAccessIcons, ProfessionalGrid, BottomNavigation } from '../components';

// Sample data for professionals
const sampleProfessionals = [
  {
    id: '1',
    name: 'João Silva - Encanador',
    category: 'Encanamento',
    rating: 4.8,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    location: 'Rua Terezinha, 172',
    badge: 'TOP',
  },
  {
    id: '2',
    name: 'Maria Santos - Fisioterapeuta',
    category: 'Saúde',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    location: 'Centro',
  },
  {
    id: '3',
    name: 'Carlos Oliveira - Eletricista',
    category: 'Serviços',
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c3a01e0a?w=300&h=300&fit=crop',
    location: 'Vila Esperança',
  },
  {
    id: '4',
    name: 'Ana Costa - Cabeleireira',
    category: 'Beleza',
    rating: 4.6,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    location: 'Shopping Center',
  },
  {
    id: '5',
    name: 'Pedro Gomes - Mecânico',
    category: 'Veículos',
    rating: 4.5,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    location: 'Zona Industrial',
  },
  {
    id: '6',
    name: 'Lucas Ferreira - Designer',
    category: 'Tecnologia',
    rating: 4.9,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=300&h=300&fit=crop',
    location: 'Tech Hub',
  },
];

const categories = [
  { id: 'all', label: 'Tudo', icon: '⭐' },
  { id: 'fashion', label: 'Moda', icon: '👔' },
  { id: 'beauty', label: 'Beleza', icon: '💄' },
  { id: 'tech', label: 'Tech', icon: '📱' },
  { id: 'services', label: 'Serviços', icon: '🛠️' },
  { id: 'health', label: 'Saúde', icon: '🏥' },
];

export const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProfessionalClick = (id: string) => {
    console.log('Professional clicked:', id);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleNavClick = (itemId: string) => {
    setActiveNavItem(itemId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-light pb-20">
      {/* Header */}
      <Header onSearch={handleSearch} onMenuClick={() => console.log('Menu clicked')} />

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Promo Banner 1 */}
        <PromoBanner
          title="Liquidação 6.6"
          subtitle="Até 70% OFF"
          discount="Ofertas válidas até 01/06"
          gradient={false}
          onAction={() => console.log('Promo clicked')}
        />

        {/* Special Offer Banner */}
        <PromoBanner
          title="Assine o Plus+"
          subtitle="com 65% OFF"
          gradient={true}
          onAction={() => console.log('Plus offer clicked')}
        />

        {/* Quick Access Icons */}
        <QuickAccessIcons />

        {/* Promo Banner 2 */}
        <PromoBanner
          title="OFERTAS RELÂMPAGO"
          subtitle="Encerram em 01:26:30"
          discount="11% OFF"
          onAction={() => console.log('Flash sale clicked')}
        />

        {/* Professionals Grid */}
        <ProfessionalGrid
          professionals={sampleProfessionals}
          onProfessionalClick={handleProfessionalClick}
          onFavoriteClick={handleFavorite}
          favorites={favorites}
          columns={2}
        />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeItem={activeNavItem}
        onItemClick={handleNavClick}
      />
    </div>
  );
};
