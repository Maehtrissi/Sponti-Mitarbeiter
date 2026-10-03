import React, { useState } from 'react';

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: (companyName: string, email: string) => void;
}

export const InvitePartnerModal: React.FC<InvitePartnerModalProps> = ({
  isOpen,
  onClose,
  onInviteSent
}) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Gastronomie');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !email.trim()) return;
    onInviteSent(companyName, email);
    setCompanyName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_business</span>
            <h3 className="font-title-md text-on-surface font-bold text-lg">Neuen Partner einladen</h3>
          </div>
          <button type="button" onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-on-surface-variant">
          Sende dem Ansprechpartner einen sicheren Onboarding-Link mit vorbereiteten Konditionen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Name des Unternehmens / Location</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="z.B. Rooftop Garden Bar"
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">E-Mail-Adresse des Inhabers</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Kategorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Gastronomie">Gastronomie</option>
              <option value="Sport & Wellness">Sport &amp; Wellness</option>
              <option value="Kultur & Events">Kultur &amp; Events</option>
              <option value="Kreativ-Workshops">Kreativ-Workshops</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg font-label-md text-on-surface"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg font-title-md hover:bg-primary-container font-semibold"
            >
              Einladung versenden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
