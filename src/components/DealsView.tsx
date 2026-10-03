import React, { useState, useMemo } from 'react';
import { Deal, Workshop, DealStatus } from '../types';

interface DealsViewProps {
  deals: Deal[];
  workshops: Workshop[];
  onSelectDeal: (deal: Deal) => void;
  onTogglePauseDeal: (dealId: string) => void;
  onApproveDeal: (dealId: string) => void;
  onOpenNewDealModal: () => void;
  onExport: () => void;
}

export const DealsView: React.FC<DealsViewProps> = ({
  deals,
  workshops,
  onSelectDeal,
  onTogglePauseDeal,
  onApproveDeal,
  onOpenNewDealModal,
  onExport
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('Alle');
  const [dealSearchQuery, setDealSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWorkshopTimeframe, setSelectedWorkshopTimeframe] = useState('Morgen');

  const statusCounts = useMemo(() => {
    return {
      Alle: deals.length,
      Live: deals.filter(d => d.status === 'Live').length,
      'In Prüfung': deals.filter(d => d.status === 'In Prüfung').length,
      Geplant: deals.filter(d => d.status === 'Geplant').length,
      Abgelaufen: deals.filter(d => d.status === 'Abgelaufen').length
    };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      if (selectedStatusTab !== 'Alle' && deal.status !== selectedStatusTab) {
        return false;
      }
      if (dealSearchQuery.trim()) {
        const q = dealSearchQuery.toLowerCase();
        return (
          deal.title.toLowerCase().includes(q) ||
          deal.partnerName.toLowerCase().includes(q) ||
          deal.locationName.toLowerCase().includes(q) ||
          deal.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [deals, selectedStatusTab, dealSearchQuery]);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Breadcrumb & Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
            <span>Partnermanagement</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Aktionen &amp; Angebote</span>
          </div>
          <h1 className="font-headline-lg text-on-surface tracking-tight">
            Spontane Aktionen, Deals &amp; Aktivitäten
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Echtzeit-Steuerung und Moderation von kurzfristigen Partnerkontingenten zur Steigerung der Frequenz und regionalen Buchungsraten.
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <button
            onClick={onExport}
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md transition-colors shadow-sm font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export</span>
          </button>
          <button
            onClick={onOpenNewDealModal}
            className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-md transition-all shadow-md active:scale-[0.98] font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Neue Aktion freigeben</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (3-spaltig) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container/60">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-md text-on-surface-variant">Live Aktionen</span>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-on-surface">{statusCounts.Live || 56}</span>
                <span className="flex items-center font-label-sm text-tertiary font-bold">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  +14%
                </span>
              </div>
              <span className="font-body-sm text-on-surface-variant mt-1 block">In 18 Partnerstandorten aktiv</span>
            </div>
            <div className="p-space-sm rounded-lg bg-tertiary/10 text-tertiary">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-surface-container-low font-body-sm">
            <span className="text-on-surface-variant">Kapazitätsauslastung</span>
            <span className="font-semibold text-on-surface">78.4%</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container/60">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-md text-on-surface-variant">Heutige Buchungen</span>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-on-surface">342</span>
                <span className="flex items-center font-label-sm text-tertiary font-bold">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  +28%
                </span>
              </div>
              <span className="font-body-sm text-on-surface-variant mt-1 block">Ø 3.2 Min. bis Bestätigung</span>
            </div>
            <div className="p-space-sm rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-surface-container-low font-body-sm">
            <span className="text-on-surface-variant">Umsatzvolumen (Sponti Pay)</span>
            <span className="font-semibold text-on-surface">8.420 €</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container/60">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-md text-on-surface-variant">Deals in Prüfung</span>
              <div className="mt-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-on-surface">{statusCounts['In Prüfung'] || 12}</span>
                <span className="flex items-center font-label-sm text-secondary font-medium">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Wartezeit ~18 Min.
                </span>
              </div>
              <span className="font-body-sm text-on-surface-variant mt-1 block">5 von neuen Partnern eingereicht</span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-surface-container-low font-body-sm">
            <span className="text-on-surface-variant">Prüfungs-SLA</span>
            <span className="font-semibold text-tertiary">98.2% eingehalten</span>
          </div>
        </div>
      </div>

      {/* Vorschau: Kurse & Workshops der nächsten Tage */}
      <div id="workshopsSection" className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 p-space-md gap-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">event_available</span>
              <h2 className="font-headline-sm text-on-surface font-bold">Vorschau: Kurse &amp; Workshops der nächsten Tage</h2>
            </div>
            <p className="font-body-sm text-on-surface-variant mt-0.5">Vorausplanung und Kapazitäten für die kommenden 7 Tage</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs">
            {['Morgen', 'Übermorgen', 'Diese Woche', 'Nächste Woche'].map((timeframe) => (
              <button
                key={timeframe}
                type="button"
                onClick={() => setSelectedWorkshopTimeframe(timeframe)}
                className={`px-space-sm py-1 rounded-full font-label-sm transition-colors ${
                  selectedWorkshopTimeframe === timeframe
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {workshops.map((ws) => {
            const pct = Math.round((ws.bookedCount / ws.totalSpots) * 100);
            return (
              <div
                key={ws.id}
                className="flex flex-col rounded-xl bg-surface-container-low p-space-md transition-all hover:shadow-md hover:bg-surface-container-lowest border border-surface-container group justify-between"
              >
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {ws.dateStr}
                    </span>
                    <span className="font-label-sm text-on-surface-variant font-semibold">
                      {ws.price}
                    </span>
                  </div>
                  <h4 className="font-title-md text-on-surface group-hover:text-primary transition-colors mt-space-xs line-clamp-1 font-bold">
                    {ws.title}
                  </h4>
                  <p className="font-body-sm text-on-surface-variant truncate">
                    {ws.provider} • {ws.location}
                  </p>
                  <div className="mt-space-sm pt-space-xs border-t border-surface-container">
                    <div className="flex items-center justify-between font-label-sm mb-1">
                      <span className="text-on-surface-variant">Belegung</span>
                      <span className={`font-semibold ${ws.isUrgent ? 'text-error' : 'text-tertiary'}`}>
                        {ws.statusLabel || `${ws.totalSpots - ws.bookedCount} / ${ws.totalSpots} frei`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full ${ws.isUrgent ? 'bg-error' : 'bg-tertiary'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-space-md flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => alert(`Details für Workshop: ${ws.title}\nAnbieter: ${ws.provider}\nKapazität: ${ws.bookedCount}/${ws.totalSpots} gebucht.`)}
                    className="flex-1 py-1.5 px-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-sm transition-colors text-center font-medium"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Kontingentverwaltung für "${ws.title}": Aktuell ${ws.totalSpots} Plätze definiert.`)}
                    className="flex-1 py-1.5 px-space-xs bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-sm transition-colors text-center font-medium"
                  >
                    Kontingent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Deals Section */}
      <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 p-space-md gap-space-md">
        {/* Filter bar & View toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container-low">
          <div className="flex flex-wrap items-center gap-space-xs">
            {(['Alle', 'Live', 'In Prüfung', 'Geplant', 'Abgelaufen'] as const).map((tab) => {
              const count = statusCounts[tab as keyof typeof statusCounts] || 0;
              const isActive = selectedStatusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedStatusTab(tab)}
                  className={`px-space-md py-1.5 rounded-full font-label-md transition-all shadow-sm ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                tune
              </span>
              <input
                value={dealSearchQuery}
                onChange={(e) => setDealSearchQuery(e.target.value)}
                className="w-full pl-9 pr-space-md py-1.5 bg-surface-container-low rounded-lg font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all"
                placeholder="Filtern nach Partner, Tag..."
                type="text"
              />
            </div>
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Rasteransicht"
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Listenansicht"
              >
                <span className="material-symbols-outlined text-[20px]">table_rows</span>
              </button>
            </div>
          </div>
        </div>

        {/* Deals Container */}
        {filteredDeals.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant font-body-md">
            Keine Aktionen für diesen Filter gefunden.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {filteredDeals.map((deal) => {
              const pct = deal.totalCapacity > 0 ? Math.round((deal.bookedCount / deal.totalCapacity) * 100) : 0;
              const isLive = deal.status === 'Live';
              const isInReview = deal.status === 'In Prüfung';
              const isPlanned = deal.status === 'Geplant';
              const isExpired = deal.status === 'Abgelaufen';

              return (
                <div
                  key={deal.id}
                  className="flex flex-col rounded-xl bg-surface-container-low p-space-md transition-all hover:shadow-md hover:bg-surface-container-lowest group relative border border-surface-container/60 justify-between"
                >
                  <div>
                    {/* Top Row: Partner Logo + Title + Status Pill */}
                    <div className="flex items-center justify-between gap-space-sm mb-space-sm">
                      <div className="flex items-center gap-space-sm min-w-0">
                        {deal.logoUrl ? (
                          <img
                            src={deal.logoUrl}
                            alt={deal.partnerName}
                            className="w-8 h-8 rounded-lg object-cover shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold">
                            <span className="material-symbols-outlined text-[18px]">store</span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-on-surface font-semibold truncate">
                            {deal.partnerName}
                          </span>
                          <span className="font-body-sm text-on-surface-variant truncate">
                            {deal.locationName}
                          </span>
                        </div>
                      </div>

                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                          Live
                        </span>
                      )}
                      {isInReview && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-container font-label-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                          In Prüfung
                        </span>
                      )}
                      {isPlanned && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          Geplant
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                          Abgelaufen
                        </span>
                      )}
                    </div>

                    {/* Image Banner */}
                    <div className="relative w-full h-36 rounded-lg overflow-hidden mb-space-sm">
                      <img
                        src={deal.imageUrl || deal.logoUrl}
                        alt={deal.title}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          isExpired ? 'grayscale-[30%] opacity-80' : ''
                        }`}
                      />
                      {deal.timeRemaining && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-label-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            {isExpired ? 'history' : isPlanned ? 'calendar_today' : isInReview ? 'pending_actions' : 'timer'}
                          </span>
                          <span>{deal.timeRemaining}</span>
                        </div>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectDeal(deal)}
                      className="font-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1 cursor-pointer font-bold"
                    >
                      {deal.title}
                    </h3>
                    <p className="font-body-sm text-on-surface-variant mt-1 line-clamp-2">
                      {deal.description}
                    </p>

                    {/* Capacity and Rate Bar */}
                    <div className="mt-space-md pt-space-sm border-t border-surface-container flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between font-label-md">
                        <span className="text-on-surface-variant">
                          {isInReview ? 'Angebotenes Kontingent' : isExpired ? 'Abschluss-Quote' : 'Kontingent'}
                        </span>
                        <span className="text-on-surface font-semibold">
                          {isInReview ? `${deal.totalCapacity} Plätze` : `${deal.bookedCount} / ${deal.totalCapacity} ${isExpired ? 'Plätze' : 'gebucht'}`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isExpired ? 'bg-outline' : isPlanned ? 'bg-secondary' : pct > 80 ? 'bg-tertiary' : 'bg-primary'
                          }`}
                          style={{ width: `${isInReview ? 0 : pct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats & Rating Row */}
                    <div className="mt-space-sm flex items-center justify-between pt-space-xs text-body-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className={`material-symbols-outlined text-[18px] ${isInReview ? 'text-outline' : 'text-tertiary'}`}>
                          {isInReview ? 'verified_user' : isPlanned ? 'event_seat' : isExpired ? 'check_circle' : 'trending_up'}
                        </span>
                        <span className="font-label-sm text-on-surface font-medium">
                          {isInReview ? 'Preiskontrolle ok' : deal.bookingRate || `${pct}% Buchungsrate`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface">
                        {isInReview ? (
                          <span className="font-label-sm text-on-surface-variant">Partner Level: {deal.partnerLevel || 'Gold'}</span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-primary-container text-[16px] fill-1">star</span>
                            <span className="font-label-sm font-semibold">{deal.rating}</span>
                            <span className="text-on-surface-variant text-[11px]">({deal.reviewCount})</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="mt-space-md flex items-center gap-space-xs pt-2">
                    {isInReview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => alert(`Rückfragen an Partner ${deal.partnerName} senden.`)}
                          className="flex-1 py-1.5 px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md transition-colors text-center font-medium"
                        >
                          Rückfragen
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveDeal(deal.id)}
                          className="flex-1 py-1.5 px-space-sm bg-tertiary hover:bg-tertiary-container text-on-tertiary rounded-lg font-label-md transition-colors text-center font-semibold"
                        >
                          Deal freigeben
                        </button>
                      </>
                    ) : isExpired ? (
                      <button
                        type="button"
                        onClick={() => onTogglePauseDeal(deal.id)}
                        className="w-full py-1.5 px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md transition-colors text-center font-medium"
                      >
                        Erneut auflegen (Re-Launch)
                      </button>
                    ) : isPlanned ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectDeal(deal)}
                          className="flex-1 py-1.5 px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md transition-colors text-center font-medium"
                        >
                          Editieren
                        </button>
                        <button
                          type="button"
                          onClick={() => onTogglePauseDeal(deal.id)}
                          className="flex-1 py-1.5 px-space-sm bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md transition-colors text-center font-semibold"
                        >
                          Jetzt aktivieren
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onTogglePauseDeal(deal.id)}
                          className="flex-1 py-1.5 px-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md transition-colors text-center font-medium"
                        >
                          Pausieren
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectDeal(deal)}
                          className="flex-1 py-1.5 px-space-sm bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md transition-colors text-center font-semibold"
                        >
                          Details &amp; Live-Log
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table List View */
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg">Aktion / Titel</th>
                  <th className="py-2.5 px-3">Partner &amp; Standort</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Kontingent</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <img src={deal.logoUrl || deal.imageUrl} alt="" className="w-7 h-7 rounded object-cover" />
                        <span>{deal.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-body-sm text-on-surface-variant">
                      {deal.partnerName} • {deal.locationName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm font-semibold ${
                        deal.status === 'Live' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-on-surface'
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-body-sm text-on-surface font-medium">
                      {deal.bookedCount} / {deal.totalCapacity}
                    </td>
                    <td className="py-3 px-3 font-body-sm text-on-surface">
                      ★ {deal.rating} ({deal.reviewCount})
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectDeal(deal)}
                        className="px-2.5 py-1 bg-primary text-white rounded font-label-sm hover:bg-primary-container"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="mt-space-md pt-space-md border-t border-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <span className="font-body-sm text-on-surface-variant">
            Zeige <strong className="text-on-surface">{filteredDeals.length} von {deals.length}</strong> aktiven Angeboten
          </span>
          <div className="flex items-center gap-space-xs">
            <button
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Zurück
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md font-bold" type="button">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors" type="button">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors" type="button">
              3
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors" type="button">
              Weiter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
