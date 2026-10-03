import React from 'react';
import { CustomerMember } from '../types';

interface CustomerDetailModalProps {
  customer: CustomerMember | null;
  onClose: () => void;
  onStatusChange?: (customerId: string, status: CustomerMember['status']) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onStatusChange
}) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-surface-container flex flex-col gap-space-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${customer.avatarColor || 'bg-primary/10 text-primary'} flex items-center justify-center text-lg font-bold`}>
              {customer.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-on-surface font-bold text-lg">{customer.name}</h3>
                <span className="font-label-sm text-outline">{customer.spontiId}</span>
              </div>
              <div className="font-body-sm text-on-surface-variant">{customer.email}</div>
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

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="p-3 rounded-lg bg-surface-container-low">
            <span className="font-label-sm text-outline uppercase font-semibold">Mitgliedsstufe</span>
            <div className="font-title-md text-on-surface font-bold mt-0.5">{customer.tier}</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-container-low">
            <span className="font-label-sm text-outline uppercase font-semibold">Status</span>
            <div className="font-title-md text-tertiary font-bold mt-0.5">{customer.status}</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-container-low space-y-2 border border-surface-container/60">
          <div className="flex justify-between font-body-sm">
            <span className="text-on-surface-variant">Telefonnummer:</span>
            <span className="font-medium text-on-surface">{customer.phone}</span>
          </div>
          <div className="flex justify-between font-body-sm">
            <span className="text-on-surface-variant">Mitglied seit:</span>
            <span className="font-medium text-on-surface">{customer.joinedDate}</span>
          </div>
          <div className="flex justify-between font-body-sm">
            <span className="text-on-surface-variant">Einlösungen gesamt:</span>
            <span className="font-bold text-primary">{customer.redemptionsCount} Deals</span>
          </div>
          <div className="flex justify-between font-body-sm">
            <span className="text-on-surface-variant">Letzte Aktivität:</span>
            <span className="font-medium text-on-surface">{customer.lastActivity} ({customer.lastDealName})</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-space-xs border-t border-surface-container mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg font-label-md text-on-surface"
          >
            Schließen
          </button>
          <div className="flex items-center gap-2">
            {customer.status === 'Aktiv' ? (
              <button
                type="button"
                onClick={() => {
                  if (onStatusChange) onStatusChange(customer.id, 'Pausiert');
                  onClose();
                }}
                className="px-3 py-2 bg-surface-container hover:bg-error-container/20 text-error rounded-lg font-label-md font-medium"
              >
                Konto pausieren
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onStatusChange) onStatusChange(customer.id, 'Aktiv');
                  onClose();
                }}
                className="px-3 py-2 bg-tertiary text-white rounded-lg font-label-md font-semibold"
              >
                Konto aktivieren
              </button>
            )}
            <button
              type="button"
              onClick={() => alert(`Support-Ticket für ${customer.name} eröffnet.`)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-title-md hover:bg-primary-container font-semibold"
            >
              Nachricht senden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
