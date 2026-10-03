import React, { useState, useRef, useEffect } from 'react';
import { Partner, Deal, CustomerMember, NavTab } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  partners: Partner[];
  deals: Deal[];
  customers: CustomerMember[];
  onSelectPartner: (partner: Partner) => void;
  onSelectDeal: (deal: Deal) => void;
  onSelectCustomer: (customer: CustomerMember) => void;
  onNavigate: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  partners,
  deals,
  customers,
  onSelectPartner,
  onSelectDeal,
  onSelectCustomer,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Alle Standorte');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPartners = searchQuery.trim()
    ? partners.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredDeals = searchQuery.trim()
    ? deals.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.partnerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredCustomers = searchQuery.trim()
    ? customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasSearchResults = filteredPartners.length > 0 || filteredDeals.length > 0 || filteredCustomers.length > 0;

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-xl border-b border-surface-container-low">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-space-sm flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            title="Navigation öffnen"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div ref={searchContainerRef} className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setIsSearchOpen(true);
              }}
              placeholder="Kunden, Unternehmen, Aktionen suchen..."
              className="w-full pl-10 pr-space-md py-1.5 bg-surface-container-low rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-[0_0_0_1px_rgba(0,104,95,0.2)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}

            {/* Quick Search Flyout Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-space-sm max-h-96 overflow-y-auto z-50">
                {!hasSearchResults ? (
                  <div className="py-4 text-center font-body-sm text-on-surface-variant">
                    Keine Treffer für &quot;{searchQuery}&quot; gefunden.
                  </div>
                ) : (
                  <div className="flex flex-col gap-space-sm text-left">
                    {filteredPartners.length > 0 && (
                      <div>
                        <div className="font-label-sm text-outline uppercase tracking-wider px-2 py-1">Partnerunternehmen</div>
                        {filteredPartners.slice(0, 3).map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onSelectPartner(p);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">store</span>
                              <div>
                                <div className="font-title-md text-body-md text-on-surface">{p.name}</div>
                                <div className="font-body-sm text-on-surface-variant">{p.city} • {p.category}</div>
                              </div>
                            </div>
                            <span className="font-label-sm text-primary">{p.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredDeals.length > 0 && (
                      <div className="border-t border-surface-container pt-1">
                        <div className="font-label-sm text-outline uppercase tracking-wider px-2 py-1">Spontane Deals & Aktionen</div>
                        {filteredDeals.slice(0, 3).map(d => (
                          <div
                            key={d.id}
                            onClick={() => {
                              onSelectDeal(d);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-tertiary text-[18px]">bolt</span>
                              <div>
                                <div className="font-title-md text-body-md text-on-surface">{d.title}</div>
                                <div className="font-body-sm text-on-surface-variant">{d.partnerName} • {d.locationName}</div>
                              </div>
                            </div>
                            <span className="font-label-sm text-tertiary">{d.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredCustomers.length > 0 && (
                      <div className="border-t border-surface-container pt-1">
                        <div className="font-label-sm text-outline uppercase tracking-wider px-2 py-1">Mitglieder</div>
                        {filteredCustomers.slice(0, 3).map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              onSelectCustomer(c);
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-secondary text-[18px]">person</span>
                              <div>
                                <div className="font-title-md text-body-md text-on-surface">{c.name}</div>
                                <div className="font-body-sm text-on-surface-variant">{c.email} • {c.tier}</div>
                              </div>
                            </div>
                            <span className="font-label-sm text-on-surface-variant">{c.spontiId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Filters in Header */}
          <div className="hidden xl:flex items-center gap-space-xs relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="px-space-sm py-1 rounded bg-surface-container font-label-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center gap-1"
              >
                <span>{selectedCity}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {showCityDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-surface-container-lowest rounded-lg shadow-md border border-surface-container p-1 min-w-[140px] z-50">
                  {['Alle Standorte', 'Berlin', 'München', 'Hamburg', 'Köln'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded text-body-sm hover:bg-surface-container-low text-on-surface"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="px-space-sm py-1 rounded bg-surface-container font-label-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors inline-flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              Aktiv
            </button>
          </div>
        </div>

        {/* Right Section: Notifications, Help, User Profile */}
        <div className="flex items-center gap-space-md">
          {/* Notifications button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title="Benachrichtigungen"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-space-sm z-50">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <span className="font-title-md text-on-surface">Benachrichtigungen</span>
                  <span className="font-label-sm text-tertiary cursor-pointer hover:underline">Alle als gelesen</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="p-2 rounded-lg bg-surface-container-low flex flex-col gap-0.5">
                    <span className="font-label-sm text-tertiary font-semibold">Neuer Deal eingereicht</span>
                    <span className="font-body-sm text-on-surface">Skyline Lounge 360 hat einen neuen Sundowner-Deal zur Prüfung eingereicht.</span>
                    <span className="font-label-sm text-outline mt-1">Vor 25 Min.</span>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-surface-container-low transition-colors flex flex-col gap-0.5">
                    <span className="font-label-sm text-primary font-semibold">Partner-Verifizierung</span>
                    <span className="font-body-sm text-on-surface">Aura Day Spa & Wellness wartet auf Freigabe der Gewerbeanmeldung.</span>
                    <span className="font-label-sm text-outline mt-1">Vor 45 Min.</span>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-surface-container-low transition-colors flex flex-col gap-0.5">
                    <span className="font-label-sm text-secondary font-semibold">Kapazitäts-Alarm</span>
                    <span className="font-body-sm text-on-surface">Café Röstwerk & Bakery Deal ist zu 90% ausgebucht.</span>
                    <span className="font-label-sm text-outline mt-1">Vor 1 Std.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help button */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Hilfe & Dokumentation"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          {/* Admin User Profile */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-space-sm pl-space-sm cursor-pointer select-none"
            >
              <img
                alt="Sarah Weber"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 shadow-xs"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIvlBDUc7n7DUwEq4lgajAmw0FlbZsZYFcTG-5cKbtIS0x_9neRBhNZbXhs98Sgzq0JjCXL_mqNFxqd5gsGsckay0wU1X93RYpHO5LvqCh1sUElSMtp90WHgantCNUhRxlDElhhaU_Gu8MQjc_k6MEmUkxHPboIZw-XzDaZ1YiGnbOw4cFJnE3S3P9J3-cyrNv2n023OKQw7GpTRiHZc3HzrwlLpqiP_H8WgRIoEP4MC7iuHPE_QtQ4Q"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-on-surface leading-tight font-semibold">Sarah Weber</span>
                <span className="font-label-sm text-on-surface-variant">Admin</span>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-1 z-50">
                <div className="px-3 py-2 border-b border-surface-container">
                  <div className="font-label-md text-on-surface font-semibold">Sarah Weber</div>
                  <div className="font-body-sm text-on-surface-variant">sarah.weber@sponti.de</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('einstellungen');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-body-md text-on-surface hover:bg-surface-container flex items-center gap-2 mt-1"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">manage_accounts</span>
                  <span>Profil & Einstellungen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('aktivitaeten-und-deals');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-body-md text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                  <span>Live-Moderation</span>
                </button>
                <div className="border-t border-surface-container my-1"></div>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 rounded-lg font-body-md text-error hover:bg-error-container/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Abmelden</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">help</span>
                <h3 className="font-title-md text-on-surface text-lg">Sponti B2B Core Kurzanleitung</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3 font-body-md text-on-surface-variant">
              <p>
                <strong>Unternehmen & Partner:</strong> Pflege alle B2B Accounts, verifiziere Nachweise und manage Kooperations-Konditionen.
              </p>
              <p>
                <strong>Aktivitäten & Deals:</strong> Schalte kurzfristige Spontan-Kontingente live, pausiere Angebote oder moderiere eingereichte Aktionen.
              </p>
              <p>
                <strong>Kunden & Mitglieder:</strong> Überwache Mitgliedsstufen, Club Gold Abonnements und Einlösungsquoten in Echtzeit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-2 w-full py-2 bg-primary text-white rounded-lg font-title-md hover:bg-primary-container transition-colors"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
};
