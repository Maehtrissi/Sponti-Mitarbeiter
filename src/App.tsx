import React, { useState } from 'react';
import {
  NavTab,
  Partner,
  Deal,
  CustomerMember,
  ActivityLogItem,
  ToastMessage
} from './types';
import {
  INITIAL_PARTNERS,
  INITIAL_DEALS,
  WORKSHOPS_DATA,
  INITIAL_CUSTOMERS,
  ACTIVITY_LOGS
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PartnersView } from './components/PartnersView';
import { DealsView } from './components/DealsView';
import { CustomersView } from './components/CustomersView';
import { NewPartnerView } from './components/NewPartnerView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { PartnerDetailModal } from './components/PartnerDetailModal';
import { DealDetailModal } from './components/DealDetailModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { NewCustomerModal } from './components/NewCustomerModal';
import { InvitePartnerModal } from './components/InvitePartnerModal';
import { SendMessageModal } from './components/SendMessageModal';
import { NewDealModal } from './components/NewDealModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('uebersicht');
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [workshops] = useState(WORKSHOPS_DATA);
  const [customers, setCustomers] = useState<CustomerMember[]>(INITIAL_CUSTOMERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(ACTIVITY_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<Partner | null>(null);
  const [selectedDealDetail, setSelectedDealDetail] = useState<Deal | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<CustomerMember | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isInvitePartnerModalOpen, setIsInvitePartnerModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast Helper
  const showToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Operations
  const handleAddPartner = (newPartner: Partner) => {
    setPartners((prev) => [newPartner, ...prev]);
    setCurrentTab('unternehmen-und-partner');
    showToast('Partnerunternehmen angelegt', `${newPartner.name} wurde erfolgreich erfasst und im Sponti B2B Netzwerk aktiviert.`);
    setActivityLogs((prev) => [
      {
        id: `act-${Date.now()}`,
        userInitials: 'B2B',
        userName: 'Admin Sarah',
        timeAgo: 'Gerade eben',
        description: `Neues Partnerunternehmen ${newPartner.name} in ${newPartner.city} angelegt.`,
        partnerHighlight: newPartner.name,
        type: 'system'
      },
      ...prev
    ]);
  };

  const handleSaveDraft = () => {
    showToast('Entwurf gespeichert', 'Die Partnerdaten wurden lokal zwischengespeichert.', 'info');
  };

  const handleAddDeal = (newDeal: Deal) => {
    setDeals((prev) => [newDeal, ...prev]);
    showToast('Aktion freigegeben', `"${newDeal.title}" ist ab sofort in der Sponti-App sichtbar.`);
  };

  const handleTogglePauseDeal = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const newStatus = d.status === 'Live' ? 'Abgelaufen' : 'Live';
          showToast(
            newStatus === 'Live' ? 'Deal reaktiviert' : 'Deal pausiert',
            `Status für "${d.title}" wurde auf ${newStatus} gesetzt.`,
            newStatus === 'Live' ? 'success' : 'warning'
          );
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
  };

  const handleApproveDeal = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          showToast('Deal genehmigt & live geschaltet', `"${d.title}" von ${d.partnerName} ist jetzt für Sponti-Kunden buchbar.`);
          return { ...d, status: 'Live', timeRemaining: 'Noch 4 Std. 00 Min.' };
        }
        return d;
      })
    );
  };

  const handleVerifyPartner = (partnerId: string) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          showToast('Partner verifiziert', `${p.name} wurde erfolgreich verifiziert.`);
          return { ...p, status: 'Verifiziert' };
        }
        return p;
      })
    );
  };

  const handleAddCustomer = (newCustomer: CustomerMember) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('Kunde hinzugefügt', `${newCustomer.name} wurde als ${newCustomer.tier} registriert.`);
  };

  const handleQuickAction = (actionName: string) => {
    if (actionName === 'verify') {
      const pendingPartner = partners.find((p) => p.status === 'In Prüfung');
      if (pendingPartner) {
        setSelectedPartnerDetail(pendingPartner);
      } else {
        showToast('Keine offenen Prüfungen', 'Alle Partner sind bereits verifiziert.', 'info');
      }
    } else if (actionName === 'commission') {
      setCurrentTab('analysen-und-berichte');
      showToast('Provisionsübersicht geladen', 'Sponti B2B Provisionsabrechnung geöffnet.', 'info');
    } else if (actionName === 'contracts') {
      showToast('B2B Vertragsvorlagen', 'Standard-Kooperationsvertrag (PDF) steht bereit.', 'info');
    } else if (actionName === 'release-notes') {
      showToast('Sponti Release v2.4', 'Neues Widget für Buchungs-Slots mit Sofort-Scanner aktiviert.', 'info');
    }
  };

  const handleExportData = (type: 'partners' | 'deals' | 'customers' = 'partners') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'partners') {
      csvContent += 'ID;Name;Branche;Stadt;Kontakt;Deals;Buchungen;Status\r\n';
      partners.forEach((p) => {
        csvContent += `${p.spontiId};${p.name};${p.category};${p.city};${p.contactEmail};${p.dealsCount};${p.bookingsCount};${p.status}\r\n`;
      });
    } else if (type === 'deals') {
      csvContent += 'Titel;Partner;Standort;Gebucht;Kapazität;Rating;Status\r\n';
      deals.forEach((d) => {
        csvContent += `${d.title};${d.partnerName};${d.locationName};${d.bookedCount};${d.totalCapacity};${d.rating};${d.status}\r\n`;
      });
    } else {
      csvContent += 'ID;Name;Email;Telefon;Stufe;Einlösungen;Status\r\n';
      customers.forEach((c) => {
        csvContent += `${c.spontiId};${c.name};${c.email};${c.phone};${c.tier};${c.redemptionsCount};${c.status}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sponti_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export erfolgreich', `CSV-Datei für ${type} wurde heruntergeladen.`);
  };

  const handleSendMessage = (targetSegment: string, subject: string) => {
    showToast('Nachricht versendet', `"${subject}" wurde an ${targetSegment} versendet.`);
  };

  const handleInvitePartner = (companyName: string, email: string) => {
    showToast('Einladung versendet', `Onboarding-Link an ${email} (${companyName}) gesendet.`);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        partnerCount={partners.length}
        liveDealsCount={deals.filter((d) => d.status === 'Live').length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Sticky Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          partners={partners}
          deals={deals}
          customers={customers}
          onSelectPartner={(partner) => setSelectedPartnerDetail(partner)}
          onSelectDeal={(deal) => setSelectedDealDetail(deal)}
          onSelectCustomer={(cust) => setSelectedCustomerDetail(cust)}
          onNavigate={(tab) => setCurrentTab(tab)}
        />

        {/* View Content */}
        <main className="relative pt-20 px-space-md lg:px-space-xl py-space-lg flex-1">
          {currentTab === 'uebersicht' && (
            <DashboardView
              partners={partners}
              activityLogs={activityLogs}
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectPartner={(partner) => setSelectedPartnerDetail(partner)}
              onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
              onOpenInvitePartnerModal={() => setIsInvitePartnerModalOpen(true)}
              onVerifyPartner={handleVerifyPartner}
            />
          )}

          {currentTab === 'unternehmen-und-partner' && (
            <PartnersView
              partners={partners}
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectPartner={(partner) => setSelectedPartnerDetail(partner)}
              onExport={() => handleExportData('partners')}
              onQuickAction={handleQuickAction}
            />
          )}

          {currentTab === 'aktivitaeten-und-deals' && (
            <DealsView
              deals={deals}
              workshops={workshops}
              onSelectDeal={(deal) => setSelectedDealDetail(deal)}
              onTogglePauseDeal={handleTogglePauseDeal}
              onApproveDeal={handleApproveDeal}
              onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
              onExport={() => handleExportData('deals')}
            />
          )}

          {currentTab === 'kunden-und-mitglieder' && (
            <CustomersView
              customers={customers}
              onSelectCustomer={(cust) => setSelectedCustomerDetail(cust)}
              onOpenSendMessageModal={() => setIsSendMessageModalOpen(true)}
              onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
              onExport={() => handleExportData('customers')}
            />
          )}

          {currentTab === 'neues-unternehmen' && (
            <NewPartnerView
              onNavigate={(tab) => setCurrentTab(tab)}
              onCreatePartner={handleAddPartner}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {currentTab === 'analysen-und-berichte' && <AnalyticsView />}

          {currentTab === 'einstellungen' && <SettingsView onShowToast={showToast} />}
        </main>
      </div>

      {/* Global Modals */}
      <PartnerDetailModal
        partner={selectedPartnerDetail}
        onClose={() => setSelectedPartnerDetail(null)}
        onVerify={handleVerifyPartner}
      />

      <DealDetailModal
        deal={selectedDealDetail}
        onClose={() => setSelectedDealDetail(null)}
        onTogglePause={handleTogglePauseDeal}
        onApprove={handleApproveDeal}
      />

      <CustomerDetailModal
        customer={selectedCustomerDetail}
        onClose={() => setSelectedCustomerDetail(null)}
        onStatusChange={(id, status) => {
          setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
          showToast('Mitgliederstatus geändert', `Neuer Status: ${status}`);
        }}
      />

      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <InvitePartnerModal
        isOpen={isInvitePartnerModalOpen}
        onClose={() => setIsInvitePartnerModalOpen(false)}
        onInviteSent={handleInvitePartner}
      />

      <SendMessageModal
        isOpen={isSendMessageModalOpen}
        onClose={() => setIsSendMessageModalOpen(false)}
        onSend={handleSendMessage}
      />

      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
        partners={partners}
        onAddDeal={handleAddDeal}
      />

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
