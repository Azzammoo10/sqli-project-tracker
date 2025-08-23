import { HistoryIcon, RotateCcw } from 'lucide-react';

interface HistoryHeaderProps {
  total: number;
  filtered: number;
  actionsCount: number;
  entitiesCount: number;
  onReset: () => void;
}

export default function HistoryHeader({ total, filtered, actionsCount, entitiesCount, onReset }: HistoryHeaderProps) {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Même design que contact-requests.tsx */}
        <div className="mb-8">
          <div className="relative rounded-xl text-white p-6 shadow-md bg-gradient-to-br from-[#1F1B2E] via-[#2E2347] to-[#3D2B66]">
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <HistoryIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Historique des Actions</h1>
                  <p className="text-white/90 text-lg">Suivi complet des opérations système</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques - Même design que contact-requests.tsx */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-50 grid place-items-center">
                <HistoryIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 grid place-items-center">
                <RotateCcw className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Affichés</p>
                <p className="text-2xl font-bold text-gray-900">{filtered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-green-50 grid place-items-center">
                <HistoryIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actions</p>
                <p className="text-2xl font-bold text-gray-900">{actionsCount === 0 ? 'Toutes' : actionsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-purple-50 grid place-items-center">
                <HistoryIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entités</p>
                <p className="text-2xl font-bold text-gray-900">{entitiesCount === 0 ? 'Toutes' : entitiesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
