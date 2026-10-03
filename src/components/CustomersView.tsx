import React, { useState, useMemo } from 'react';
import { CustomerMember, MemberTier, MemberStatus } from '../types';

interface CustomersViewProps {
  customers: CustomerMember[];
  onSelectCustomer: (customer: CustomerMember) => void;
  onOpenSendMessageModal: () => void;
  onOpenNewCustomerModal: () => void;
  onExport: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomer,
  onOpenSendMessageModal,
  onOpenNewCustomerModal,
  onExport
}) => {
  const [selectedSegmentTab, setSelectedSegmentTab] = useState<string>('Alle Mitglieder');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('Alle Stufen');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Alle Status');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCustomerIds(customers.map(c => c.id));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Segment tabs
      if (selectedSegmentTab === 'VIP / Vielnutzer' && c.tier !== 'Sponti Club Gold' && c.redemptionsCount < 20) return false;
      if (selectedSegmentTab === 'Inaktiv' && c.status !== 'Pausiert') return false;
      if (selectedSegmentTab === 'Gesperrt' && c.status !== 'Gesperrt') return false;
      if (selectedSegmentTab === 'Neue Mitglieder (< 7 Tage)' && !c.joinedDate.includes('Heute') && !c.joinedDate.includes('Gestern')) return false;

      // Tier
      if (selectedTierFilter !== 'Alle Stufen' && c.tier !== selectedTierFilter) return false;

      // Status
      if (selectedStatusFilter !== 'Alle Status' && c.status !== selectedStatusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.spontiId.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [customers, selectedSegmentTab, selectedTierFilter, selectedStatusFilter, searchQuery]);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header Section with Action Triggers */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm uppercase tracking-wider font-semibold">
              User Directory
            </span>
            <span className="text-on-surface-variant font-body-sm">• Live Sync aktiviert</span>
          </div>
          <h1 className="font-headline-lg text-on-surface tracking-tight">
            Kunden- &amp; Mitgliederverwaltung
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Alle registrierten Sponti-Nutzer, Mitgliedschaftsstufen und Nutzungsaktivitäten auf einen Blick.
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={onOpenSendMessageModal}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-title-md shadow-sm hover:bg-surface-container-low transition-all border border-surface-container/60 font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">forward_to_inbox</span>
            <span>Nachricht an Segmente senden</span>
          </button>
          <button
            onClick={onOpenNewCustomerModal}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-title-md shadow-sm hover:bg-primary-container transition-all font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Mitglied einladen</span>
          </button>
        </div>
      </div>

      {/* Metric / KPI Bento Grid (3-spaltig) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Metric 1: Gesamtmitglieder */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Gesamtmitglieder
            </span>
            <span className="p-2 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-on-surface tracking-tight">14.820</span>
            <span className="inline-flex items-center gap-0.5 text-tertiary font-label-md font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +8.4%
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pt-space-xs">
            <div className="flex items-center justify-between font-body-sm text-on-surface-variant">
              <span>Verifizierte Mobilnummern</span>
              <span className="font-medium text-on-surface">89%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '89%' }}></div>
            </div>
          </div>
        </div>

        {/* Metric 2: Aktive Nutzer */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Aktive Nutzer (30 Tage)
            </span>
            <span className="p-2 rounded-lg bg-surface-container-low text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-on-surface tracking-tight">9.410</span>
            <span className="inline-flex items-center gap-0.5 text-tertiary font-label-md font-bold">
              <span className="material-symbols-outlined text-[16px]">moving</span>
              +14.2%
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pt-space-xs">
            <div className="flex items-center justify-between font-body-sm text-on-surface-variant">
              <span>Engagement-Rate (Spontan-Aktionen)</span>
              <span className="font-semibold text-tertiary">63.5%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container rounded-full" style={{ width: '63.5%' }}></div>
            </div>
          </div>
        </div>

        {/* Metric 3: Club Members */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Premium Sponti-Club Member
            </span>
            <span className="p-2 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            </span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-on-surface tracking-tight">2.140</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm font-semibold">
              Monatliches Abo
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pt-space-xs">
            <div className="flex items-center justify-between font-body-sm text-on-surface-variant">
              <span>Conversion-Ziel (Q2)</span>
              <span className="font-medium text-on-surface">14.4% von Gesamt</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Hub: Filters & Directory Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 overflow-hidden flex flex-col">
        {/* Segment Tabs */}
        <div className="flex items-center gap-space-xs px-space-md pt-space-md pb-space-sm overflow-x-auto bg-surface-container-lowest border-b border-surface-container-low">
          {[
            { label: 'Alle Mitglieder', count: '14.820', badgeClass: 'bg-primary/20 text-on-primary' },
            { label: 'Neue Mitglieder (< 7 Tage)', count: '412', badgeClass: 'bg-surface-container text-on-secondary-container' },
            { label: 'VIP / Vielnutzer', count: '1.890', badgeClass: 'bg-surface-container text-on-secondary-container' },
            { label: 'Inaktiv', count: '730', badgeClass: 'bg-surface-container text-on-secondary-container' },
            { label: 'Gesperrt', count: '18', badgeClass: 'bg-error-container text-on-error-container' }
          ].map((tab) => {
            const isActive = selectedSegmentTab === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSelectedSegmentTab(tab.label)}
                className={`px-space-md py-2 rounded-lg font-title-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-2 py-0.5 rounded-full font-label-sm ${tab.badgeClass}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="px-space-md py-space-sm flex flex-col lg:flex-row items-center justify-between gap-space-sm bg-surface-container-low/40">
          <div className="flex items-center gap-space-sm w-full lg:w-auto flex-1 max-w-lg">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                filter_list
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-space-md py-1.5 bg-surface-container-lowest rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                placeholder="Nach Name, E-Mail oder Sponti-ID filtern..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-space-xs w-full lg:w-auto justify-end overflow-x-auto">
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1.5 rounded-lg shadow-sm">
              <span className="font-label-sm text-on-surface-variant">Stufe:</span>
              <select
                value={selectedTierFilter}
                onChange={(e) => setSelectedTierFilter(e.target.value)}
                className="bg-transparent font-label-md text-on-surface focus:outline-none cursor-pointer"
              >
                <option>Alle Stufen</option>
                <option>Sponti Free</option>
                <option>Sponti Club Gold</option>
                <option>Student</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1.5 rounded-lg shadow-sm">
              <span className="font-label-sm text-on-surface-variant">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-label-md text-on-surface focus:outline-none cursor-pointer"
              >
                <option>Alle Status</option>
                <option>Aktiv</option>
                <option>E-Mail unbestätigt</option>
                <option>Pausiert</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTierFilter('Alle Stufen');
                setSelectedStatusFilter('Alle Status');
              }}
              className="p-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm"
              title="Filter zurücksetzen"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm font-label-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider select-none">
                <th className="py-3 px-space-md w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedCustomerIds.length === customers.length && customers.length > 0}
                    className="rounded w-4 h-4 text-primary focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-space-md">Mitglied</th>
                <th className="py-3 px-space-md">Kontaktdaten</th>
                <th className="py-3 px-space-md">Mitgliedschaftstyp</th>
                <th className="py-3 px-space-md">Beigetreten am</th>
                <th className="py-3 px-space-md text-center">Genutzte Aktionen</th>
                <th className="py-3 px-space-md">Letzte Aktivität</th>
                <th className="py-3 px-space-md text-center">Status</th>
                <th className="py-3 px-space-md text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-on-surface-variant">
                    Keine Mitglieder für die gewählten Filterkriterien gefunden.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-3 px-space-md text-center">
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(member.id)}
                        onChange={() => toggleSelectCustomer(member.id)}
                        className="rounded w-4 h-4 text-primary focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div
                          className={`w-9 h-9 rounded-full ${member.avatarColor || 'bg-primary/10 text-primary'} font-headline-sm flex items-center justify-center shrink-0 font-bold`}
                        >
                          {member.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            onClick={() => onSelectCustomer(member)}
                            className="font-title-md text-on-surface leading-snug truncate cursor-pointer hover:text-primary transition-colors font-semibold"
                          >
                            {member.name}
                          </span>
                          <span className="font-label-sm text-on-surface-variant">{member.spontiId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="flex flex-col font-body-sm">
                        <span className="text-on-surface font-medium truncate">{member.email}</span>
                        <span className="text-on-surface-variant">{member.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-space-md">
                      {member.tier === 'Sponti Club Gold' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[14px]">stars</span>
                          Sponti Club Gold
                        </span>
                      ) : member.tier === 'Student' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[14px]">school</span>
                          Student
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm font-medium">
                          Sponti Free
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-space-md font-body-sm text-on-surface-variant">
                      {member.joinedDate}
                    </td>
                    <td className="py-3 px-space-md text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container-high font-label-md font-semibold text-on-surface">
                        {member.redemptionsCount} Einlösungen
                      </span>
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="flex flex-col">
                        <span className="font-body-sm text-on-surface font-medium">{member.lastActivity}</span>
                        <span className="font-label-sm text-tertiary truncate">{member.lastDealName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-space-md text-center">
                      {member.status === 'Aktiv' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          Aktiv
                        </span>
                      ) : member.status === 'E-Mail unbestätigt' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-secondary-container font-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          E-Mail unbestätigt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          Pausiert
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-space-md text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onSelectCustomer(member)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Profil öffnen"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        </button>
                        <button
                          onClick={() => onSelectCustomer(member)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Verlauf"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">history</span>
                        </button>
                        <button
                          onClick={() => alert(`Direktnachricht an ${member.name} (${member.email}) vorbereiten.`)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Nachricht"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Table Footer */}
        <div className="px-space-md py-space-sm bg-surface-container-low/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container-low">
          <div className="flex items-center gap-space-sm font-body-sm text-on-surface-variant">
            <span>
              Zeige <strong className="text-on-surface font-medium">1 - {filteredCustomers.length}</strong> von{' '}
              <strong className="text-on-surface font-medium">14.820</strong> Mitgliedern
            </span>
            <span className="hidden md:inline">•</span>
            <div className="hidden md:flex items-center gap-1">
              <span>Zeilen pro Seite:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-surface-container-lowest text-on-surface rounded px-1.5 py-0.5 font-label-sm focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface disabled:opacity-40 transition-colors shadow-sm"
              disabled={currentPage === 1}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">first_page</span>
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="p-1.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface disabled:opacity-40 transition-colors shadow-sm"
              disabled={currentPage === 1}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1 px-1">
              <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-md font-semibold" type="button">
                1
              </button>
              <button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md transition-colors" type="button">
                2
              </button>
              <button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md transition-colors" type="button">
                3
              </button>
              <span className="px-1 text-outline font-label-sm">...</span>
              <button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md transition-colors" type="button">
                296
              </button>
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            <button
              onClick={() => setCurrentPage(296)}
              className="p-1.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">last_page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
