import React, { useState } from 'react';
import { CustomerMember, MemberTier } from '../types';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: CustomerMember) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+49 ');
  const [tier, setTier] = useState<MemberTier>('Sponti Free');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newCustomer: CustomerMember = {
      id: `mem-${Date.now()}`,
      spontiId: `#SP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      initials: initials || 'NE',
      email,
      phone,
      tier,
      joinedDate: 'Heute',
      redemptionsCount: 0,
      lastActivity: 'Gerade eben',
      lastDealName: 'Registrierung',
      status: 'Aktiv'
    };

    onAddCustomer(newCustomer);
    setName('');
    setEmail('');
    setPhone('+49 ');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
            <h3 className="font-title-md text-on-surface font-bold text-lg">Neuen Kunden anlegen</h3>
          </div>
          <button type="button" onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Vollständiger Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Julia Meier"
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">E-Mail-Adresse</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="julia.meier@example.com"
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Mobilfunknummer</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Mitgliedschaftsstufe</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as MemberTier)}
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Sponti Free">Sponti Free</option>
              <option value="Sponti Club Gold">Sponti Club Gold</option>
              <option value="Student">Student</option>
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
              Kunde erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
