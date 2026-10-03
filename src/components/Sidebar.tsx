import React from 'react';
import { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  partnerCount: number;
  liveDealsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  partnerCount = 14,
  liveDealsCount = 56,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems: { tab: NavTab; label: string; icon: string; badge?: string; badgeColor?: string }[] = [
    {
      tab: 'uebersicht',
      label: 'Übersicht',
      icon: 'dashboard'
    },
    {
      tab: 'unternehmen-und-partner',
      label: 'Unternehmen & Partner',
      icon: 'store',
      badge: `${partnerCount}`,
      badgeColor: 'bg-secondary-container text-on-secondary-fixed'
    },
    {
      tab: 'kunden-und-mitglieder',
      label: 'Kunden & Mitglieder',
      icon: 'group'
    },
    {
      tab: 'aktivitaeten-und-deals',
      label: 'Aktivitäten & Deals',
      icon: 'local_activity',
      badge: 'Live',
      badgeColor: 'bg-tertiary text-on-tertiary'
    },
    {
      tab: 'analysen-und-berichte',
      label: 'Analysen & Berichte',
      icon: 'monitoring'
    },
    {
      tab: 'einstellungen',
      label: 'Einstellungen',
      icon: 'settings'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-surface-container-low/60">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectTab('uebersicht')}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[20px] text-white">bolt</span>
              </div>
              <span className="font-headline-sm text-primary tracking-tight font-bold">Sponti</span>
            </div>
            <span className="ml-auto bg-surface-container px-space-xs py-0.5 rounded text-on-secondary-container font-label-sm uppercase tracking-wider font-semibold">
              B2B Core
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="px-space-md py-space-sm flex flex-col gap-1 mt-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab || (currentTab === 'neues-unternehmen' && item.tab === 'unternehmen-und-partner');
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.tab);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors text-left w-full ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-title-md shadow-xs'
                      : 'font-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-on-primary-container' : 'text-outline'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full font-label-sm ${item.badgeColor || 'bg-secondary-container text-on-secondary-fixed'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status bottom widget */}
        <div className="p-space-md m-space-md bg-surface-container-low rounded-xl border border-surface-container/60">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">System Status</span>
            <span className="inline-flex items-center gap-1 font-label-sm text-tertiary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              Aktiv
            </span>
          </div>
          <div className="font-body-sm text-on-surface-variant">API Gateway: 99.98%</div>
          <div className="mt-space-sm h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-tertiary-container rounded-full w-full"></div>
          </div>
        </div>
      </aside>
    </>
  );
};
