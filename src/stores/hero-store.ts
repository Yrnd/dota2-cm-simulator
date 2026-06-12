import { create } from 'zustand';
import { ALL_HEROES, Hero, HeroRole } from '@/data/heroes';
import synergyMatrix from '@/data/synergy-matrix.json';
import counterMatrix from '@/data/counter-matrix.json';

interface HeroState {
  heroes: Hero[];
  filteredHeroes: Hero[];
  synergyMatrix: Record<string, number>;
  counterMatrix: Record<string, number>;
  searchQuery: string;
  attributeFilter: string | null;
  roleFilter: HeroRole | null;
  setSearchQuery: (query: string) => void;
  setAttributeFilter: (attr: string | null) => void;
  setRoleFilter: (role: HeroRole | null) => void;
  filterHeroes: () => void;
  getHeroById: (id: number) => Hero | undefined;
}

export const useHeroStore = create<HeroState>((set, get) => ({
  heroes: ALL_HEROES,
  filteredHeroes: ALL_HEROES,
  synergyMatrix: synergyMatrix as Record<string, number>,
  counterMatrix: counterMatrix as Record<string, number>,
  searchQuery: '',
  attributeFilter: null,
  roleFilter: null,
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterHeroes();
  },
  setAttributeFilter: (attr) => {
    set({ attributeFilter: attr });
    get().filterHeroes();
  },
  setRoleFilter: (role) => {
    set({ roleFilter: role });
    get().filterHeroes();
  },
  filterHeroes: () => {
    const { heroes, searchQuery, attributeFilter, roleFilter } = get();
    let filtered = heroes;
    if (searchQuery) {
      filtered = filtered.filter(h => h.localizedName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (attributeFilter) {
      filtered = filtered.filter(h => h.primaryAttr === attributeFilter);
    }
    if (roleFilter) {
      filtered = filtered.filter(h => h.roles.includes(roleFilter));
    }
    set({ filteredHeroes: filtered });
  },
  getHeroById: (id) => get().heroes.find(h => h.id === id),
}));
