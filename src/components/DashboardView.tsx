import React, { useState } from 'react';
import { Partner, ActivityLogItem, NavTab } from '../types';

interface DashboardViewProps {
  partners: Partner[];
  activityLogs: ActivityLogItem[];
  onNavigate: (tab: NavTab) => void;
  onSelectPartner: (partner: Partner) => void;
  onOpenNewCustomerModal: () => void;
  onOpenInvitePartnerModal: () => void;
  onVerifyPartner: (partnerId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  partners,
  activityLogs,
  onNavigate,
  onSelectPartner,
  onOpenNewCustomerModal,
  onOpenInvitePartnerModal,
  onVerifyPartner
}) => {
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [showLogModal, setShowLogModal] = useState(false);

  const displayedPartners = partners.slice(0, 4);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-low">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 -bottom-20 h-48 w-48 rounded-full bg-tertiary/5 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-space-md lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs rounded-full bg-surface-container-high px-space-sm py-0.5 text-on-secondary-container">
              <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-sm uppercase tracking-wider font-semibold">Live Netzwerk Übersicht</span>
            </div>
            <h1 className="mt-space-xs font-headline-lg text-on-surface tracking-tight">
              Willkommen zurück, Sarah!
            </h1>
            <p className="mt-1 font-body-md text-on-surface-variant">
              Hier ist der aktuelle Status deiner Community und Partnernetzwerke. Heute verzeichnen wir eine um 18% gesteigerte Interaktionsrate bei Live-Aktionen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={onOpenNewCustomerModal}
              className="group inline-flex items-center gap-space-xs rounded-lg bg-surface-container-low px-space-md py-2.5 font-label-md text-on-surface shadow-sm hover:bg-surface-container-high transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">
                person_add
              </span>
              <span>Kunde anlegen</span>
            </button>
            <button
              onClick={onOpenInvitePartnerModal}
              className="group inline-flex items-center gap-space-xs rounded-lg bg-primary px-space-md py-2.5 font-label-md text-on-primary shadow-sm hover:bg-primary-container transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                add_business
              </span>
              <span>Neuen Partner einladen</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Kooperationspartner */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container-low">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-on-surface-variant">Kooperationspartner</span>
            <span className="rounded-lg bg-surface-container p-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-on-surface">148</span>
            <span className="inline-flex items-center rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-on-tertiary-fixed font-semibold">
              Aktiv: 139
            </span>
          </div>
          <div className="mt-space-sm flex items-center justify-between font-body-sm text-on-surface-variant">
            <div className="inline-flex items-center gap-1 text-tertiary font-medium">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="font-label-md">+12</span>
            </div>
            <span>Diesen Monat hinzugefügt</span>
          </div>
          <div className="mt-3 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '93%' }}></div>
          </div>
        </div>

        {/* Card 2: Registrierte Mitglieder */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container-low">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-on-surface-variant">Registrierte Mitglieder</span>
            <span className="rounded-lg bg-surface-container p-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-on-surface">14.820</span>
            <span className="font-label-sm text-tertiary font-semibold">+6.1%</span>
          </div>
          <div className="mt-space-sm flex items-center justify-between font-body-sm text-on-surface-variant">
            <div className="inline-flex items-center gap-1 text-tertiary font-medium">
              <span className="material-symbols-outlined text-[16px]">person_check</span>
              <span className="font-label-md">+840</span>
            </div>
            <span>Neuanmeldungen lfd.</span>
          </div>
          <div className="mt-3 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-tertiary-container rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Card 3: Aktive Spontan-Aktionen */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container-low">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-on-surface-variant">Aktive Spontan-Aktionen</span>
            <span className="relative rounded-lg bg-surface-container p-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-error animate-ping"></span>
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-on-surface">56</span>
            <span className="inline-flex items-center rounded-full bg-secondary-container px-2 py-0.5 font-label-sm text-on-secondary-fixed font-semibold">
              Live Deals
            </span>
          </div>
          <div className="mt-space-sm flex items-center justify-between font-body-sm text-on-surface-variant">
            <div className="inline-flex items-center gap-1 text-primary font-medium">
              <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
              <span className="font-label-md">24 Standorte</span>
            </div>
            <span>Events heute</span>
          </div>
          <div className="mt-3 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '64%' }}></div>
          </div>
        </div>

        {/* Card 4: Partner-Umsatz */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md border border-surface-container-low">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-on-surface-variant">Partner-Umsatz / Vermittl.</span>
            <span className="rounded-lg bg-surface-container p-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-on-surface">48.950 €</span>
          </div>
          <div className="mt-space-sm flex items-center justify-between font-body-sm text-on-surface-variant">
            <div className="inline-flex items-center gap-1 text-tertiary font-medium">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              <span className="font-label-md">+18.4%</span>
            </div>
            <span>vs. Vormonat</span>
          </div>
          <div className="mt-3 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-tertiary rounded-full" style={{ width: '86%' }}></div>
          </div>
        </div>
      </section>

      {/* Main Grid: Recently Added Partners & Community Activity */}
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 items-start">
        {/* Left: Recently Added Partners Table (8 cols) */}
        <section className="lg:col-span-8 flex flex-col rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-low">
          <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm">
            <div>
              <h2 className="font-title-md text-on-surface tracking-tight text-base font-bold">
                Kürzlich hinzugefügte Unternehmen & Partner
              </h2>
              <p className="font-body-sm text-on-surface-variant">
                Verifizierte Profile und anstehende Onboarding-Prüfungen
              </p>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                onClick={() => setPartnerFilter(partnerFilter === 'all' ? 'pending' : 'all')}
                className={`inline-flex items-center gap-1 rounded-lg px-space-sm py-1.5 font-label-sm transition-colors ${
                  partnerFilter === 'pending'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>{partnerFilter === 'pending' ? 'Nur Prüfung' : 'Filter'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('unternehmen-und-partner')}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-container-low px-space-sm py-1.5 font-label-sm text-primary hover:bg-surface-container-high transition-colors font-semibold"
              >
                <span>Alle anzeigen</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-space-xs">
            <table className="w-full text-left font-body-md text-on-surface">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg" scope="col">Unternehmen</th>
                  <th className="py-2.5 px-3" scope="col">Kategorie</th>
                  <th className="py-2.5 px-3" scope="col">Standort</th>
                  <th className="py-2.5 px-3" scope="col">Status</th>
                  <th className="py-2.5 px-3" scope="col">Ansprechpartner</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg" scope="col">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {displayedPartners
                  .filter(p => partnerFilter === 'all' || (partnerFilter === 'pending' && p.status === 'In Prüfung'))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-space-sm">
                          {p.logoUrl ? (
                            <img
                              className="h-9 w-9 rounded-lg object-cover shadow-sm shrink-0"
                              src={p.logoUrl}
                              alt={p.name}
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold shrink-0">
                              <span className="material-symbols-outlined text-[20px]">store</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-title-md text-on-surface truncate text-sm font-semibold">
                              {p.name}
                            </div>
                            <div className="font-body-sm text-on-surface-variant">ID: {p.spontiId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-on-secondary-container">
                          <span className="material-symbols-outlined text-[14px]">
                            {p.category.includes('Gastro') ? 'restaurant' : p.category.includes('Sport') ? 'fitness_center' : 'theater_comedy'}
                          </span>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-body-sm text-on-surface-variant">
                        {p.city}, {p.district}
                      </td>
                      <td className="py-3 px-3">
                        {p.status === 'In Prüfung' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2 py-0.5 font-label-sm text-on-surface font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-outline"></span>
                            In Prüfung
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-on-tertiary-fixed font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-body-sm text-on-surface">
                        {p.contactName}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onSelectPartner(p)}
                            className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                            title="Details öffnen"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          {p.status === 'In Prüfung' ? (
                            <button
                              onClick={() => onVerifyPartner(p.id)}
                              className="p-1.5 rounded-md text-tertiary hover:bg-surface-container-high transition-colors"
                              title="Freigeben"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectPartner(p)}
                              className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                              title="Bearbeiten"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto pt-space-md flex flex-wrap items-center justify-between text-on-surface-variant font-body-sm border-t border-surface-container-low">
            <span>Zeige {displayedPartners.length} von 148 Partnern</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="p-1 rounded bg-surface-container-low text-on-surface hover:bg-surface-container disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm">1</span>
              <button
                type="button"
                onClick={() => onNavigate('unternehmen-und-partner')}
                className="px-2 py-0.5 rounded text-on-surface-variant hover:bg-surface-container-low font-label-sm"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => onNavigate('unternehmen-und-partner')}
                className="px-2 py-0.5 rounded text-on-surface-variant hover:bg-surface-container-low font-label-sm"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => onNavigate('unternehmen-und-partner')}
                className="p-1 rounded bg-surface-container-low text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right: Community Activity Feed (4 cols) */}
        <section className="lg:col-span-4 flex flex-col rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-low">
          <div className="flex items-center justify-between pb-space-xs">
            <div>
              <h2 className="font-title-md text-on-surface tracking-tight text-base font-bold">
                Kunden-Aktivitäten
              </h2>
              <p className="font-body-sm text-on-surface-variant">Echtzeit-Feed der Community</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-on-tertiary-fixed font-semibold">
              Live Sync
            </span>
          </div>

          <div className="relative mt-space-sm flex flex-col gap-space-md">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-surface-container"></div>
            {activityLogs.map((item) => (
              <div key={item.id} className="relative flex items-start gap-space-sm">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-label-sm shadow-sm ${
                    item.type === 'redemption'
                      ? 'bg-primary text-on-primary'
                      : item.type === 'registration'
                      ? 'bg-tertiary text-on-tertiary'
                      : item.type === 'system'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-secondary text-on-secondary'
                  }`}
                >
                  {item.type === 'system' ? (
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  ) : (
                    item.userInitials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-title-md text-body-md text-on-surface truncate font-semibold">
                      {item.userName}
                    </span>
                    <span className="shrink-0 font-label-sm text-outline">{item.timeAgo}</span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="mt-space-md w-full rounded-lg bg-surface-container-low py-2 font-label-md text-on-surface hover:bg-surface-container-high transition-colors text-center font-medium"
            type="button"
          >
            Vollständiges Protokoll einsehen
          </button>
        </section>
      </div>

      {/* Category Breakdown Section */}
      <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-low">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-title-md text-on-surface tracking-tight text-base font-bold">
              Kategorie-Verteilung im Partner-Netzwerk
            </h2>
            <p className="font-body-sm text-on-surface-variant">Branchensegmente der aktiven B2B-Kooperationen</p>
          </div>
          <div className="flex items-center gap-space-md font-label-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary"></span> Ziel: &gt;50% Gastro
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-tertiary"></span> Hohe Interaktion: Sport
            </span>
          </div>
        </div>

        <div className="mt-space-md grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-surface-container-low p-space-sm border border-surface-container/60">
            <div className="flex items-center justify-between font-label-md">
              <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[18px] text-primary">restaurant</span>
                Gastronomie
              </span>
              <span className="font-headline-sm text-primary font-bold">42%</span>
            </div>
            <div className="mt-space-xs h-2 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: '42%' }}></div>
            </div>
            <div className="mt-1 flex justify-between font-body-sm text-on-surface-variant">
              <span>62 Partner</span>
              <span className="text-primary font-medium">+4 neu</span>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm border border-surface-container/60">
            <div className="flex items-center justify-between font-label-md">
              <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[18px] text-tertiary">fitness_center</span>
                Sport & Fitness
              </span>
              <span className="font-headline-sm text-tertiary font-bold">28%</span>
            </div>
            <div className="mt-space-xs h-2 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="h-full rounded-full bg-tertiary transition-all duration-500" style={{ width: '28%' }}></div>
            </div>
            <div className="mt-1 flex justify-between font-body-sm text-on-surface-variant">
              <span>41 Partner</span>
              <span className="text-tertiary font-medium">+5 neu</span>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm border border-surface-container/60">
            <div className="flex items-center justify-between font-label-md">
              <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[18px] text-secondary">theater_comedy</span>
                Kultur & Events
              </span>
              <span className="font-headline-sm text-secondary font-bold">18%</span>
            </div>
            <div className="mt-space-xs h-2 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="h-full rounded-full bg-secondary transition-all duration-500" style={{ width: '18%' }}></div>
            </div>
            <div className="mt-1 flex justify-between font-body-sm text-on-surface-variant">
              <span>27 Partner</span>
              <span className="text-secondary font-medium">+2 neu</span>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm border border-surface-container/60">
            <div className="flex items-center justify-between font-label-md">
              <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-[18px] text-outline">category</span>
                Sonstiges
              </span>
              <span className="font-headline-sm text-outline font-bold">12%</span>
            </div>
            <div className="mt-space-xs h-2 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="h-full rounded-full bg-outline transition-all duration-500" style={{ width: '12%' }}></div>
            </div>
            <div className="mt-1 flex justify-between font-body-sm text-on-surface-variant">
              <span>18 Partner</span>
              <span className="text-outline font-medium">+1 neu</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full Activity Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">history</span>
                <h3 className="font-title-md text-on-surface text-lg">Echtzeit-Aktivitätsprotokoll</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {activityLogs.concat([
                {
                  id: 'act-5',
                  userInitials: 'MK',
                  userName: 'Michael Klein',
                  timeAgo: 'vor 1 Std.',
                  description: 'Gutschein-Code für Escape Matrix Experience eingelöst.',
                  type: 'redemption'
                },
                {
                  id: 'act-6',
                  userInitials: 'SYS',
                  userName: 'Sponti Pay Bot',
                  timeAgo: 'vor 2 Std.',
                  description: 'Auszahlungslauf für 18 Münchner Gastro-Partner erfolgreich verarbeitet.',
                  type: 'system'
                }
              ]).map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-surface-container-low flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm font-semibold shrink-0 text-primary">
                    {item.userInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-on-surface font-semibold">{item.userName}</span>
                      <span className="text-outline text-body-sm">• {item.timeAgo}</span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="mt-2 w-full py-2 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-lg font-title-md transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
