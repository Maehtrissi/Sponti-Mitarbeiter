import React from 'react';
import { Partner } from '../types';

interface PartnerDetailModalProps {
  partner: Partner | null;
  onClose: () => void;
  onVerify?: (partnerId: string) => void;
}

export const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  partner,
  onClose,
  onVerify
}) => {
  if (!partner) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-space-lg shadow-2xl border border-surface-container flex flex-col gap-space-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-3">
            {partner.logoUrl ? (
              <img src={partner.logoUrl} alt={partner.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">store</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-on-surface font-bold">{partner.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold">
                  {partner.status}
                </span>
              </div>
              <div className="font-body-sm text-on-surface-variant">
                {partner.spontiId} • {partner.legalForm || 'GmbH'} • {partner.category}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Hero banner if available */}
        {partner.heroImageUrl && (
          <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm">
            <img src={partner.heroImageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 text-white">
              <div>
                <span className="font-label-sm uppercase tracking-wider opacity-90">{partner.subCategory}</span>
                <div className="font-title-md font-bold">{partner.address}</div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {partner.description && (
          <p className="font-body-md text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-surface-container">
            {partner.description}
          </p>
        )}

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container/60 space-y-1">
            <span className="font-label-sm text-outline uppercase font-semibold">Ansprechpartner &amp; Support</span>
            <div className="font-title-md text-on-surface font-semibold">{partner.contactName}</div>
            <div className="font-body-sm text-on-surface-variant">{partner.contactEmail}</div>
            <div className="font-body-sm text-on-surface-variant">{partner.contactPhone}</div>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container/60 space-y-1">
            <span className="font-label-sm text-outline uppercase font-semibold">B2B Konditionen &amp; Check-in</span>
            <div className="font-title-md text-on-surface font-semibold">{partner.tier || 'Standard'} ({partner.commissionRate || 10}% Provision)</div>
            <div className="font-body-sm text-on-surface-variant">Auszahlung: {partner.payoutInterval || '14-tägig'}</div>
            <div className="font-body-sm text-tertiary font-medium">Scanner: {partner.checkInSystem || 'Partner-App'}</div>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-surface-container">
          <div className="p-2 rounded bg-surface-container-low">
            <span className="font-label-sm text-outline">Aktive Deals</span>
            <div className="font-headline-sm text-on-surface font-bold">{partner.dealsCount}</div>
          </div>
          <div className="p-2 rounded bg-surface-container-low">
            <span className="font-label-sm text-outline">Buchungen gesamt</span>
            <div className="font-headline-sm text-primary font-bold">{partner.bookingsCount}</div>
          </div>
          <div className="p-2 rounded bg-surface-container-low">
            <span className="font-label-sm text-outline">Kundenzufriedenheit</span>
            <div className="font-headline-sm text-tertiary font-bold">★ {partner.satisfaction || 4.9}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-space-sm flex items-center justify-between pt-space-xs border-t border-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-md transition-colors"
          >
            Schließen
          </button>
          <div className="flex items-center gap-2">
            {partner.status === 'In Prüfung' && onVerify && (
              <button
                type="button"
                onClick={() => {
                  onVerify(partner.id);
                  onClose();
                }}
                className="px-4 py-2 bg-tertiary hover:bg-tertiary-container text-white rounded-lg font-title-md transition-colors shadow-sm font-semibold"
              >
                Account verifizieren
              </button>
            )}
            <button
              type="button"
              onClick={() => alert(`Vertragsvorlage für ${partner.name} wird als PDF generiert.`)}
              className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-lg font-title-md transition-colors shadow-sm font-semibold"
            >
              Vertrag &amp; Stammdaten bearbeiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
