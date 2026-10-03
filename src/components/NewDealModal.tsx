import React, { useState } from 'react';
import { Deal, Partner } from '../types';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  onAddDeal: (deal: Deal) => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  onClose,
  partners,
  onAddDeal
}) => {
  const [partnerId, setPartnerId] = useState(partners[0]?.id || 'spo-84920');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(15);
  const [durationHours, setDurationHours] = useState('3 Std.');

  if (!isOpen) return null;

  const selectedPartner = partners.find(p => p.id === partnerId) || partners[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      partnerId: selectedPartner.id,
      partnerName: selectedPartner.name,
      locationName: `${selectedPartner.city} ${selectedPartner.district}`,
      logoUrl: selectedPartner.logoUrl,
      imageUrl: selectedPartner.heroImageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0o-H1QJr_gt6ODv34PDSNLx6ryypwpW0rVxyNTIdIsk6mpz3RAtGy19v2OKLAaND_FZkLFW9bJjBF2khOFj-Gbj8Yv83woBQX3j9898C0udIbm_3EXTFdDxvOh9LJyLJ_BE1JSfsYm1xmReFdTxCYHYc0GB72hD0dNefiBQj3JIkOkQAUDDaU58HUoMfJ1WwAA_LdfvpOLsarfVRulMapG6qhtKS-q1UoIqFM6tmnfl1-iTfMF_mhXA',
      title,
      description: description || 'Spontanes Kontingent exklusiv über Sponti B2B.',
      status: 'Live',
      timeRemaining: `Noch ${durationHours}`,
      bookedCount: 0,
      totalCapacity: Number(capacity) || 10,
      bookingRate: '0% Buchungsrate',
      rating: 5.0,
      reviewCount: 1
    };

    onAddDeal(newDeal);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
            <h3 className="font-title-md text-on-surface font-bold text-lg">Neue spontane Aktion freigeben</h3>
          </div>
          <button type="button" onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Partnerunternehmen</label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {partners.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city} - {p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Deal-Titel</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Late-Night Bouldern 2-für-1 oder Espresso & Brioche 30%"
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface font-medium">Kontingent (Plätze / Tickets)</label>
              <input
                type="number"
                min={1}
                max={200}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface font-medium">Laufzeit</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="1 Std. 30 Min.">1.5 Stunden</option>
                <option value="3 Std.">3 Stunden</option>
                <option value="5 Std.">5 Stunden</option>
                <option value="Bis 23:00 Uhr">Heute bis 23:00 Uhr</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Beschreibung &amp; Konditionen</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bedingungen, Einlösezeitraum und Inklusivleistungen..."
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
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
              Deal sofort live schalten
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
