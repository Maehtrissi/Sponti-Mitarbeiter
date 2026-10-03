import React, { useState, useMemo } from 'react';
import { Partner, NavTab } from '../types';

interface PartnersViewProps {
  partners: Partner[];
  onNavigate: (tab: NavTab) => void;
  onSelectPartner: (partner: Partner) => void;
  onExport: () => void;
  onQuickAction: (actionName: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  onNavigate,
  onSelectPartner,
  onExport,
  onQuickAction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('aktiv');
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Active filter tags
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (selectedStatus) {
      list.push({ key: 'status', label: `Status: ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}` });
    }
    if (selectedBranch) {
      list.push({ key: 'branch', label: `Branche: ${selectedBranch}` });
    }
    if (selectedCity) {
      list.push({ key: 'city', label: `Stadt: ${selectedCity}` });
    }
    if (searchQuery) {
      list.push({ key: 'query', label: `Suche: "${searchQuery}"` });
    }
    return list;
  }, [selectedStatus, selectedBranch, selectedCity, searchQuery]);

  const removeFilter = (key: string) => {
    if (key === 'status') setSelectedStatus('');
    if (key === 'branch') setSelectedBranch('');
    if (key === 'city') setSelectedCity('');
    if (key === 'query') setSearchQuery('');
  };

  const clearAllFilters = () => {
    setSelectedStatus('');
    setSelectedBranch('');
    setSelectedCity('');
    setSearchQuery('');
  };

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.contactName.toLowerCase().includes(q) ||
          p.spontiId.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Branch
      if (selectedBranch) {
        if (selectedBranch === 'gastro' && !p.category.includes('Gastro')) return false;
        if (selectedBranch === 'sport' && !p.category.includes('Sport')) return false;
        if (selectedBranch === 'kultur' && !p.category.includes('Kultur') && !p.category.includes('Event')) return false;
        if (selectedBranch === 'outdoor' && !p.category.includes('Outdoor')) return false;
      }

      // Status
      if (selectedStatus) {
        if (selectedStatus === 'aktiv' && p.status !== 'Aktiv' && p.status !== 'Premium Partner' && p.status !== 'Verifiziert') return false;
        if (selectedStatus === 'onboarding' && p.status !== 'In Prüfung') return false;
        if (selectedStatus === 'pausiert' && p.status !== 'Pausiert') return false;
        if (selectedStatus === 'pruefung' && p.status !== 'In Prüfung') return false;
      }

      // City
      if (selectedCity) {
        if (!p.city.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      }

      return true;
    });
  }, [partners, searchQuery, selectedBranch, selectedStatus, selectedCity]);

  const topPartner = partners.find(p => p.isTopPartner) || partners[0];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-tertiary uppercase tracking-wider bg-tertiary/10 px-space-sm py-0.5 rounded-full font-bold">
              B2B Netzwerk
            </span>
            <span className="text-outline text-body-sm">•</span>
            <span className="font-body-sm text-on-surface-variant font-medium">148 verifizierte Accounts</span>
          </div>
          <h1 className="font-headline-xl text-on-surface tracking-tight">
            Partnerunternehmen &amp; Kooperationen
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-3xl">
            Verwalte alle verpartnerten Unternehmen, Locations, Konditionen und Verträge im Sponti-Ökosystem.
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-space-xs h-10 px-space-md bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors rounded-lg font-label-md shadow-sm border border-surface-container/60 font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
            <span>Partnerliste exportieren (CSV/XLS)</span>
          </button>
          <button
            onClick={() => onNavigate('neues-unternehmen')}
            className="inline-flex items-center gap-space-xs h-10 px-space-lg bg-primary hover:bg-primary-container text-on-primary rounded-lg font-title-md transition-colors shadow-sm font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_business</span>
            <span>+ Neues Unternehmen anlegen</span>
          </button>
        </div>
      </div>

      {/* KPI / Performance Highlight Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant">Aktive Partnerschaften</span>
            <span className="p-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed material-symbols-outlined text-[18px]">
              handshake
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-sm">
            <span className="font-headline-lg text-on-surface">124</span>
            <span className="font-label-sm text-tertiary flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+8.4%
            </span>
          </div>
          <span className="font-body-sm text-outline mt-space-xs">92% Auslastungsrate</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant">In Prüfung / Onboarding</span>
            <span className="p-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed material-symbols-outlined text-[18px]">
              hourglass_top
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-sm">
            <span className="font-headline-lg text-on-surface">19</span>
            <span className="font-label-sm text-on-surface-variant font-medium">5 heute eingereicht</span>
          </div>
          <span className="font-body-sm text-outline mt-space-xs">Durchschn. 2.1 Tage Freigabezeit</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant">Aktive Live-Deals</span>
            <span className="p-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed material-symbols-outlined text-[18px]">
              bolt
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-sm">
            <span className="font-headline-lg text-on-surface">482</span>
            <span className="font-label-sm text-tertiary flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+16%
            </span>
          </div>
          <span className="font-body-sm text-outline mt-space-xs">Spontan-Impulse in 4 Metropolen</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant">Vermittelter Umsatz (MTD)</span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-on-surface material-symbols-outlined text-[18px]">
              payments
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-space-sm">
            <span className="font-headline-lg text-on-surface">€384.2k</span>
            <span className="font-label-sm text-tertiary flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+22.1%
            </span>
          </div>
          <span className="font-body-sm text-outline mt-space-xs">Sponti B2B Provision: €42.2k</span>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Filter & Data Table (9 cols) */}
        <div className="xl:col-span-9 flex flex-col gap-space-md">
          {/* Filter- & Suchleiste */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-sm">
            <div className="flex flex-col lg:flex-row gap-space-sm items-stretch lg:items-center">
              {/* Suchfeld */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-space-md py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Firmenname, Ansprechpartner, ID (z.B. SPO-849)..."
                  type="text"
                />
              </div>

              {/* Dropdown Filter: Branche */}
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full lg:w-44 px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-body-md focus:outline-none focus:bg-surface-container-lowest transition-all cursor-pointer appearance-none pr-8"
                >
                  <option value="">Alle Branchen</option>
                  <option value="gastro">Gastronomie</option>
                  <option value="sport">Sport &amp; Wellness</option>
                  <option value="kultur">Event &amp; Kultur</option>
                  <option value="outdoor">Outdoor</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Dropdown Filter: Status */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full lg:w-44 px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-body-md focus:outline-none focus:bg-surface-container-lowest transition-all cursor-pointer appearance-none pr-8"
                >
                  <option value="">Alle Status</option>
                  <option value="aktiv">Aktiv</option>
                  <option value="onboarding">In Onboarding</option>
                  <option value="pausiert">Pausiert</option>
                  <option value="pruefung">Verifizierung ausstehend</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Dropdown Filter: Standort */}
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full lg:w-36 px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-body-md focus:outline-none focus:bg-surface-container-lowest transition-all cursor-pointer appearance-none pr-8"
                >
                  <option value="">Alle Städte</option>
                  <option value="berlin">Berlin</option>
                  <option value="münchen">München</option>
                  <option value="hamburg">Hamburg</option>
                  <option value="köln">Köln</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={clearAllFilters}
                className="p-2 text-outline hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center"
                title="Filter zurücksetzen"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
              </button>
            </div>

            {/* Filter Tags Bar */}
            <div className="flex items-center gap-space-xs flex-wrap pt-1">
              <span className="font-label-sm text-outline uppercase tracking-wider mr-1">Aktive Filter:</span>
              {activeFilters.length === 0 ? (
                <span className="text-body-sm text-on-surface-variant italic">Keine Filter aktiv</span>
              ) : (
                activeFilters.map(filter => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-0.5 rounded-full font-label-sm"
                  >
                    {filter.label}
                    <span
                      onClick={() => removeFilter(filter.key)}
                      className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
                    >
                      close
                    </span>
                  </span>
                ))
              )}
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="font-label-sm text-primary hover:underline ml-auto font-medium"
                  type="button"
                >
                  Alle Filter leeren
                </button>
              )}
            </div>
          </div>

          {/* Compact Data Table Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
                    <th className="py-3 px-space-md" scope="col">Unternehmen &amp; ID</th>
                    <th className="py-3 px-space-md" scope="col">Branche &amp; Typ</th>
                    <th className="py-3 px-space-md" scope="col">Standort</th>
                    <th className="py-3 px-space-md" scope="col">Hauptkontakt</th>
                    <th className="py-3 px-space-md" scope="col">Sponti-Deals / Buchungen</th>
                    <th className="py-3 px-space-md" scope="col">Status</th>
                    <th className="py-3 px-space-md text-right" scope="col">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-body-md">
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant font-body-md">
                        Keine Partnerunternehmen passend zu den Filtern gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner, index) => (
                      <tr key={partner.id} className="hover:bg-surface-container-low/60 transition-colors group">
                        <td className="py-3 px-space-md">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center font-title-md text-primary font-bold overflow-hidden shadow-sm shrink-0">
                              {partner.logoUrl ? (
                                <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[20px]">
                                  {partner.category.includes('Sport') ? 'fitness_center' : partner.category.includes('Gastro') ? 'local_cafe' : 'deck'}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                onClick={() => onSelectPartner(partner)}
                                className="font-title-md text-on-surface group-hover:text-primary transition-colors truncate cursor-pointer font-semibold"
                              >
                                {partner.name}
                              </span>
                              <span className="font-label-sm text-outline">
                                {partner.spontiId} {partner.tier ? `• ${partner.tier}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-label-md font-medium">{partner.category}</span>
                            <span className="text-outline font-body-sm">{partner.subCategory}</span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-medium">{partner.city}-{partner.district}</span>
                            <span className="text-outline font-body-sm truncate max-w-[140px]">{partner.address}</span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-label-md font-medium">{partner.contactName}</span>
                            <span className="text-outline font-body-sm">{partner.contactEmail}</span>
                          </div>
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="flex items-center gap-space-sm">
                            <div className="flex flex-col">
                              <span className="font-title-md text-on-surface font-semibold">{partner.dealsCount} Deals</span>
                              <span className="font-body-sm text-tertiary font-medium">{partner.bookingsCount} Buchungen</span>
                            </div>
                            <div className="w-12 h-6 hidden lg:block">
                              <svg className="w-full h-full text-tertiary" fill="none" viewBox="0 0 48 24">
                                {index % 2 === 0 ? (
                                  <path d="M1 20L12 16L24 18L36 7L47 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                                ) : (
                                  <path d="M1 18L14 14L26 9L38 12L47 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                                )}
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-space-md">
                          {partner.status === 'Premium Partner' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                              Premium Partner
                            </span>
                          ) : partner.status === 'In Prüfung' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm bg-surface-container-high text-on-surface-variant font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                              In Prüfung
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm bg-tertiary-fixed/70 text-on-tertiary-fixed font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                              Aktiv
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-space-md text-right relative">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onSelectPartner(partner)}
                              className="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                              title="Schnellansicht"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button
                              onClick={() => onSelectPartner(partner)}
                              className="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                              title="Weitere Aktionen"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-space-md bg-surface-container-low/40 gap-space-sm border-t border-surface-container-low">
              <div className="font-body-sm text-on-surface-variant">
                Zeige <span className="font-bold text-on-surface">{Math.min(1, filteredPartners.length)}-{filteredPartners.length}</span> von{' '}
                <span className="font-bold text-on-surface">148</span> Partnerunternehmen
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center disabled:opacity-40"
                  disabled={currentPage === 1}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 rounded-lg font-label-md flex items-center justify-center ${
                    currentPage === 1 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`w-8 h-8 rounded-lg font-label-md flex items-center justify-center ${
                    currentPage === 2 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={`w-8 h-8 rounded-lg font-label-md flex items-center justify-center ${
                    currentPage === 3 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  3
                </button>
                <span className="px-1 text-outline font-label-md">...</span>
                <button
                  onClick={() => setCurrentPage(15)}
                  className="w-8 h-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md flex items-center justify-center"
                  type="button"
                >
                  15
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top-Partner Spotlight & Quick Actions (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-space-md">
          {/* Top-Partner Spotlight Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-space-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-tertiary uppercase tracking-wider font-bold">
                Top-Partner der Woche
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                workspace_premium
              </span>
            </div>

            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt={topPartner.name}
                src={topPartner.heroImageUrl || topPartner.logoUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-transparent to-transparent flex flex-col justify-end p-space-sm text-white">
                <span className="font-title-md font-bold leading-tight">{topPartner.name}</span>
                <span className="font-label-sm opacity-90">{topPartner.city}-{topPartner.district} • {topPartner.category}</span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <div className="flex justify-between items-center py-1 border-b border-surface-container-low">
                <span className="font-body-sm text-outline">Buchungen (7 Tage)</span>
                <span className="font-title-md text-on-surface font-semibold">{topPartner.bookingsCount} Slots</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-surface-container-low">
                <span className="font-body-sm text-outline">Sponti-Conversion</span>
                <span className="font-title-md text-tertiary font-bold">{topPartner.conversionRate || 94.8}%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-body-sm text-outline">Kundenzufriedenheit</span>
                <div className="flex items-center gap-1 font-label-md text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-tertiary fill-1">star</span>
                  <span>{topPartner.satisfaction || 4.9} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container/40">
              <span className="font-label-sm text-outline uppercase font-semibold">Aktuelle Top-Aktion</span>
              <span className="font-title-md text-on-surface font-bold text-sm">
                {topPartner.currentTopDeal || 'Late-Night Boulder & Beer -25%'}
              </span>
              <span className="font-body-sm text-on-surface-variant">Noch 14 freie Plätze bis heute 23:00 Uhr</span>
            </div>

            <button
              onClick={() => onSelectPartner(topPartner)}
              className="w-full py-2 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-lg font-label-md transition-colors text-center font-semibold"
              type="button"
            >
              Partnerprofil komplett öffnen
            </button>
          </div>

          {/* Quick Action Mini-Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-space-sm">
            <span className="font-title-md text-on-surface font-bold">Schnellaktionen</span>
            <button
              type="button"
              onClick={() => onQuickAction('verify')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors group text-left w-full"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
                <span className="font-body-md text-on-surface group-hover:text-primary transition-colors font-medium">
                  Partner verifizieren
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm font-bold">
                3 Neu
              </span>
            </button>

            <button
              type="button"
              onClick={() => onQuickAction('commission')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors group text-left w-full"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-tertiary">analytics</span>
                <span className="font-body-md text-on-surface group-hover:text-tertiary transition-colors font-medium">
                  Provisionsbericht erstellen
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickAction('contracts')}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors group text-left w-full"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">contract_edit</span>
                <span className="font-body-md text-on-surface group-hover:text-secondary transition-colors font-medium">
                  B2B Vertragsvorlagen
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
            </button>
          </div>

          {/* Partner Community Insight */}
          <div className="bg-gradient-to-br from-primary-container/10 via-surface-container-lowest to-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-primary">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="font-label-sm font-bold uppercase tracking-wider">Sponti Partner Hub</span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Das neue B2B Buchungs-Widget für Gastronomie &amp; Kletterhallen ist live.
            </p>
            <a
              onClick={(e) => {
                e.preventDefault();
                onQuickAction('release-notes');
              }}
              className="font-label-md text-primary hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer font-semibold"
              href="#release-notes"
            >
              <span>Release Notes v2.4 lesen</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
