import { Search, X, FilterX } from 'lucide-react';
import type { TypeOperation, EntityName } from '../services/historyService';

interface AdvancedFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  actions: TypeOperation[];
  onActionsChange: (actions: TypeOperation[]) => void;
  entities: EntityName[];
  onEntitiesChange: (entities: EntityName[]) => void;
}

// Actions les plus importantes seulement
const COMMON_ACTIONS: TypeOperation[] = ['CREATION', 'MODIFICATION', 'SUPPRESSION', 'LOGIN', 'LOGOUT'];
const ALL_ENTITIES: EntityName[] = ['USER', 'PROJECT', 'TASK', 'AUTHENTICATION'];

const pretty = (s: string) =>
  s?.toLowerCase().replace(/_/g, ' ').replace(/^\w/, c => c?.toUpperCase()) ?? '';

const toggleIn = <T,>(arr: T[], v: T): T[] =>
  arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

export default function AdvancedFilters({ 
  search, 
  onSearchChange, 
  actions, 
  onActionsChange, 
  entities, 
  onEntitiesChange 
}: AdvancedFiltersProps) {
  return (
    <div className="px-6 mb-6 -mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Barre de recherche simple */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher dans l'historique..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white
                           text-gray-900 placeholder:text-gray-500 transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-[#4B2A7B] focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Filtres simplifiés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {/* Actions principales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onActionsChange([])}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    actions.length === 0
                      ? 'bg-[#4B2A7B] text-white border-[#4B2A7B]'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Toutes
                </button>
                {COMMON_ACTIONS.map(action => (
                  <button
                    key={action}
                    onClick={() => onActionsChange(toggleIn(actions, action))}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      actions.includes(action)
                        ? 'bg-[#4B2A7B] text-white border-[#4B2A7B]'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pretty(action)}
                  </button>
                ))}
              </div>
            </div>

            {/* Entités */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entités</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onEntitiesChange([])}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    entities.length === 0
                      ? 'bg-[#4B2A7B] text-white border-[#4B2A7B]'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Toutes
                </button>
                {ALL_ENTITIES.map(entity => (
                  <button
                    key={entity}
                    onClick={() => onEntitiesChange(toggleIn(entities, entity))}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      entities.includes(entity)
                        ? 'bg-[#4B2A7B] text-white border-[#4B2A7B]'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pretty(entity)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton Reset simple */}
          {(actions.length > 0 || entities.length > 0 || search) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onSearchChange('');
                  onActionsChange([]);
                  onEntitiesChange([]);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#4B2A7B] text-white hover:bg-[#3D2B66]"
              >
                <FilterX className="h-4 w-4 inline mr-2" />
                Réinitialiser tous les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
