import React from 'react';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'all', label: 'Tudo', icon: '⭐' },
  { id: 'fashion', label: 'Moda', icon: '👔' },
  { id: 'beauty', label: 'Beleza', icon: '💄' },
  { id: 'tech', label: 'Tecnologia', icon: '📱' },
  { id: 'services', label: 'Serviços', icon: '🛠️' },
  { id: 'health', label: 'Saúde', icon: '🏥' },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories = defaultCategories,
  activeCategory,
  onCategoryChange,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="bg-brand-yellow border-b-2 border-brand-dark">
      <div
        ref={scrollContainerRef}
        className="flex gap-1 overflow-x-auto px-2 py-3 scrollbar-hide"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-brand-blue text-brand-yellow border-2 border-brand-dark'
                : 'bg-white text-brand-blue border-2 border-brand-dark hover:bg-brand-accent'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </button>
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
