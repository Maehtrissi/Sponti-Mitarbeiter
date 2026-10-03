import React, { useState } from 'react';

interface SettingsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [gatewayStatus, setGatewayStatus] = useState('Online (99.98%)');
  const [apiKey, setApiKey] = useState('sponti_live_sec_89f0293da9218ab4401e');
  const [autoApproveDeals, setAutoApproveDeals] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [payoutBankIban, setPayoutBankIban] = useState('DE89 7002 0270 0012 3456 78');

  const handleSave = () => {
    onShowToast('Einstellungen gespeichert', 'Die Systemeinstellungen für Sponti B2B Core wurden aktualisiert.', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg max-w-4xl">
      <div>
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
          <span>Plattform</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Einstellungen</span>
        </div>
        <h1 className="font-headline-lg text-on-surface tracking-tight mt-1">
          System- &amp; Integrationseinstellungen
        </h1>
        <p className="font-body-md text-on-surface-variant">
          Verwalte Schnittstellen, Gateway-Status, POS-Scanner und Auszahlungs-Parameter für alle Partner.
        </p>
      </div>

      {/* Gateway & API Integration */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">dns</span>
            <h3 className="font-title-md text-on-surface font-bold text-base">API Gateway &amp; Webhooks</h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            {gatewayStatus}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface font-medium">B2B Core API Secret Key</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                readOnly
                className="w-full px-space-md py-2 bg-surface-container-low rounded-lg font-mono text-body-sm text-on-surface border border-surface-container"
              />
              <button
                type="button"
                onClick={() => onShowToast('API-Key kopiert', 'Der API-Schlüssel wurde in die Zwischenablage kopiert.', 'info')}
                className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-md shrink-0 font-medium"
              >
                Kopieren
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container/60">
            <div>
              <div className="font-title-md text-on-surface text-sm font-semibold">Automatische Deal-Freigabe für Gold-Partner</div>
              <div className="font-body-sm text-on-surface-variant">Kurzfristige Angebote von verifizierten Accounts ohne manuelle Prüfung listen.</div>
            </div>
            <input
              type="checkbox"
              checked={autoApproveDeals}
              onChange={(e) => setAutoApproveDeals(e.target.checked)}
              className="accent-primary w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container/60">
            <div>
              <div className="font-title-md text-on-surface text-sm font-semibold">Echtzeit-Push-Benachrichtigungen</div>
              <div className="font-body-sm text-on-surface-variant">Spontan-Impulse an registrierte App-Nutzer im Umkreis von 2 km senden.</div>
            </div>
            <input
              type="checkbox"
              checked={pushNotificationsEnabled}
              onChange={(e) => setPushNotificationsEnabled(e.target.checked)}
              className="accent-primary w-5 h-5 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Sponti Pay & Settlement */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
        <div className="flex items-center gap-2 pb-space-sm border-b border-surface-container">
          <span className="material-symbols-outlined text-primary text-[22px]">account_balance</span>
          <h3 className="font-title-md text-on-surface font-bold text-base">Sponti Pay &amp; Settlement-Konto</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-label-md text-on-surface font-medium">Sammelkonto IBAN für Auszahlungen</label>
            <input
              type="text"
              value={payoutBankIban}
              onChange={(e) => setPayoutBankIban(e.target.value)}
              className="w-full px-space-md py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface font-medium">Standard-Auszahlungstag</label>
            <select className="w-full px-space-md py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container">
              <option>Jeden Montag (08:00 Uhr)</option>
              <option>1. und 15. des Monats</option>
              <option>Monatsletzter</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface font-medium">Währung</label>
            <input
              type="text"
              value="EUR (€) - SEPA Instant"
              readOnly
              className="w-full px-space-md py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Administrator Profile Summary */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            alt="Sarah Weber"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIvlBDUc7n7DUwEq4lgajAmw0FlbZsZYFcTG-5cKbtIS0x_9neRBhNZbXhs98Sgzq0JjCXL_mqNFxqd5gsGsckay0wU1X93RYpHO5LvqCh1sUElSMtp90WHgantCNUhRxlDElhhaU_Gu8MQjc_k6MEmUkxHPboIZw-XzDaZ1YiGnbOw4cFJnE3S3P9J3-cyrNv2n023OKQw7GpTRiHZc3HzrwlLpqiP_H8WgRIoEP4MC7iuHPE_QtQ4Q"
          />
          <div>
            <div className="font-title-md text-on-surface font-bold">Sarah Weber (Super-Admin)</div>
            <div className="font-body-sm text-on-surface-variant">Vollzugriff auf Partnermanagement, Verträge &amp; Sponti Pay</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="px-space-lg py-2.5 bg-primary text-white rounded-lg font-title-md hover:bg-primary-container transition-colors shadow-sm font-semibold"
        >
          Änderungen speichern
        </button>
      </div>
    </div>
  );
};
