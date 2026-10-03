import React from 'react';
import { Deal } from '../types';

interface DealDetailModalProps {
  deal: Deal | null;
  onClose: () => void;
  onTogglePause: (dealId: string) => void;
  onApprove?: (dealId: string) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onTogglePause,
  onApprove
}) => {
  if (!deal) return null;

  const pct = deal.totalCapacity > 0 ? Math.round((deal.bookedCount / deal.totalCapacity) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-space-lg shadow-2xl border border-surface-container flex flex-col gap-space-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-3">
            {deal.logoUrl ? (
              <img src={deal.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-on-surface font-bold text-lg">{deal.title}</h3>
                <span className={`px-2 py-0.5 rounded-full font-label-sm font-semibold ${
                  deal.status === 'Live'
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                    : 'bg-surface-container text-on-surface'
                }`}>
                  {deal.status}
                </span>
              </div>
              <div className="font-body-sm text-on-surface-variant">
                {deal.partnerName} • {deal.locationName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {deal.imageUrl && (
          <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-sm">
            <img src={deal.imageUrl} alt="" className="w-full h-full object-cover" />
            {deal.timeRemaining && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-md text-white font-label-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>{deal.timeRemaining}</span>
              </div>
            )}
          </div>
        )}

        <p className="font-body-md text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
          {deal.description}
        </p>

        {/* Live Quota Progress */}
        <div className="p-space-sm bg-surface-container-low rounded-xl border border-surface-container space-y-2">
          <div className="flex justify-between items-center font-label-md">
            <span className="text-on-surface font-semibold">Kapazitätsauslastung in Echtzeit</span>
            <span className="font-bold text-primary">{deal.bookedCount} / {deal.totalCapacity} ({pct}%)</span>
          </div>
          <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="flex justify-between font-body-sm text-on-surface-variant">
            <span>Rating: ★ {deal.rating} ({deal.reviewCount} Bewertungen)</span>
            <span>{deal.totalCapacity - deal.bookedCount} Plätze noch frei</span>
          </div>
        </div>

        {/* Live Redemption Log Mini-Feed */}
        <div className="space-y-2">
          <span className="font-label-sm text-outline uppercase font-semibold">Aktuelle Einlösungs-Historie (POS)</span>
          <div className="space-y-1.5 text-body-sm">
            <div className="p-2 rounded bg-surface-container-low flex justify-between items-center">
              <span className="font-medium text-on-surface">Gast #SP-9481 (Max M.)</span>
              <span className="text-outline text-xs">Vor 14 Min. via App-Scan</span>
            </div>
            <div className="p-2 rounded bg-surface-container-low flex justify-between items-center">
              <span className="font-medium text-on-surface">Gast #SP-8924 (Lisa S.)</span>
              <span className="text-outline text-xs">Vor 32 Min. via App-Scan</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-space-xs border-t border-surface-container mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg font-label-md text-on-surface transition-colors"
          >
            Schließen
          </button>
          <div className="flex items-center gap-2">
            {deal.status === 'In Prüfung' && onApprove ? (
              <button
                type="button"
                onClick={() => {
                  onApprove(deal.id);
                  onClose();
                }}
                className="px-4 py-2 bg-tertiary hover:bg-tertiary-container text-white rounded-lg font-title-md transition-colors font-semibold"
              >
                Deal jetzt freigeben
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onTogglePause(deal.id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg font-title-md transition-colors font-semibold text-white ${
                  deal.status === 'Live'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-primary hover:bg-primary-container'
                }`}
              >
                {deal.status === 'Live' ? 'Deal pausieren' : 'Deal aktivieren'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
