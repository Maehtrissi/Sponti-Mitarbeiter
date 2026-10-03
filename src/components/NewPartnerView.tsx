import React, { useState } from 'react';
import { Partner, NavTab } from '../types';

interface NewPartnerViewProps {
  onNavigate: (tab: NavTab) => void;
  onCreatePartner: (partner: Partner) => void;
  onSaveDraft: () => void;
}

export const NewPartnerView: React.FC<NewPartnerViewProps> = ({
  onNavigate,
  onCreatePartner,
  onSaveDraft
}) => {
  // Form State initialized with matching default demo data from user's screen
  const [formData, setFormData] = useState({
    name: 'Urban Craft Pottery Studio',
    legalForm: 'GmbH & Co. KG',
    hrb: 'HRB 198273 (AG München)',
    category: 'Kreativ-Workshops',
    description: 'Handwerkliche Töpferkurse, offene Drehscheiben-Sessions und freies Modellieren im Herzen des Glockenbachviertels. Spontan buchbar für kreative Pausen.',
    website: 'https://urbancraft-pottery.de',
    instagram: 'urbancraft.studio',
    street: 'Müllerstraße 42, Rückgebäude Atelier 3',
    zipCity: '80469 München',
    districtCluster: 'München - Glockenbach / Isarvorstadt',
    checkInInstructions: 'Direkt an der Kasse den QR-Code vorzeigen. Schürzen werden gestellt.',
    contactName: 'Lena Sommer',
    contactRole: 'Geschäftsführung & Studioleitung',
    contactEmail: 'lena.sommer@urbancraft-pottery.de',
    contactPhone: '+49 89 2488 9120',
    invoiceEmail: 'invoices@urbancraft-pottery.de',
    tier: 'Premium Partner' as 'Standard' | 'Premium Partner' | 'Pilot Beta',
    payoutInterval: '14-tägig' as 'Wöchentlich' | '14-tägig' | 'Monatlich',
    checkInSystem: 'Partner-App Scanner (iOS / Android Smartphone)',
    hasBusinessLicense: false
  });

  const categories = [
    { label: 'Kreativ-Workshops', icon: 'palette' },
    { label: 'Gastronomie', icon: 'restaurant' },
    { label: 'Sport & Fitness', icon: 'fitness_center' },
    { label: 'Wellness & Spa', icon: 'spa' },
    { label: 'Kultur & Events', icon: 'theater_comedy' }
  ];

  const handleCreateFinal = (e: React.FormEvent) => {
    e.preventDefault();
    const newPartner: Partner = {
      id: `spo-${Date.now().toString().slice(-5)}`,
      spontiId: `SPO-${Math.floor(10000 + Math.random() * 90000)}`,
      name: formData.name,
      legalForm: formData.legalForm,
      hrb: formData.hrb,
      category: formData.category,
      subCategory: 'Atelier & Handwerk',
      city: 'München',
      district: 'Glockenbach',
      address: `${formData.street}, ${formData.zipCity}`,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      dealsCount: 1,
      bookingsCount: 0,
      status: 'Aktiv',
      satisfaction: 5.0,
      conversionRate: 100,
      currentTopDeal: 'Schnupper-Töpfern 2-für-1',
      description: formData.description,
      website: formData.website,
      instagram: formData.instagram,
      tier: formData.tier,
      commissionRate: formData.tier === 'Premium Partner' ? 10 : formData.tier === 'Standard' ? 15 : 5,
      payoutInterval: formData.payoutInterval,
      checkInSystem: formData.checkInSystem,
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXKW4MiXJ3U809xERKjJRBMEOlKvt6_GJ1VHlnXtdAClDKrz2bpKr_yKOkX5QIqUexXBQUwvawuZzCx_EEiJFUPIrEXDJws6cADQsq3JLAFYMGWooPIWcL7X4HOjR60xn2iFyBUcGTy3Y-gXRI-Nd_aN9rksQH1phSo6EkdZzIJQz5RABu_zNHxkmvjLbto3epuZ76VB50DZTOlyweklR8DTzrs33D37XX4YJxPyXXGX1woke-Kf6WAQ',
      heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgV_bRI_mVvgoUPU2pen7q16vXAydBik9TkcLNAI_8r-h8vBtu_W2kmCyL24x-2aQJUvVIPn-RCSlvQZ3M2vtgzdQvPw_5UlO1YjERnA17eFt94LwnWcQaTkLkbcm37RbivqcNeISGt9FSQYwR3PMp6ph-9SgQELGNCEOOfUABj13-rMdnEjyEmN0GVNd1p8IshWpSybrGPp8y3SR5UoFYjgIwpT_9fcGptsED_G6glW5Ojz8nF69vMQ'
    };

    onCreatePartner(newPartner);
  };

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
            <a
              onClick={(e) => {
                e.preventDefault();
                onNavigate('unternehmen-und-partner');
              }}
              className="hover:text-primary transition-colors cursor-pointer"
              href="#partners"
            >
              Partnermanagement
            </a>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <a
              onClick={(e) => {
                e.preventDefault();
                onNavigate('unternehmen-und-partner');
              }}
              className="hover:text-primary transition-colors cursor-pointer"
              href="#partners"
            >
              Unternehmen &amp; Partner
            </a>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-title-md">Neues Unternehmen anlegen</span>
          </nav>
          <h1 className="font-headline-xl text-on-surface tracking-tight mt-1">
            Neues Partnerunternehmen anlegen
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl">
            Erfasse Stammdaten, Standorte, Ansprechpartner, Buchungskonditionen und lade alle relevanten Marken- und Verifizierungs-Assets hoch.
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <button
            onClick={onSaveDraft}
            className="px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md transition-all flex items-center gap-1.5 shadow-sm border border-surface-container/60 font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Als Entwurf speichern</span>
          </button>
          <button
            onClick={handleCreateFinal}
            className="px-space-md py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md transition-all flex items-center gap-1.5 shadow-sm font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Unternehmen anlegen &amp; Prüfung starten</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Section Grid Layout (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column: Form Sections (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Section 1: Basisdaten & Profil */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-title-md font-bold">
                  1
                </span>
                <div>
                  <h2 className="font-title-md text-on-surface font-bold text-base">Basisdaten &amp; Unternehmensprofil</h2>
                  <p className="font-body-sm text-on-surface-variant">Rechtliche Stammdaten und die öffentliche Beschreibung</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-secondary-container font-label-sm font-semibold">
                Erforderlich
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-label-md text-on-surface flex items-center justify-between font-semibold">
                  Firmenname / Markenname
                  <span className="text-tertiary font-label-sm font-bold">Öffentlich sichtbar</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  placeholder="z. B. Studio Momentum GmbH"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Rechtsform</label>
                <input
                  type="text"
                  value={formData.legalForm}
                  onChange={(e) => setFormData({ ...formData, legalForm: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  placeholder="z. B. GmbH, UG, Einzelunternehmen"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Handelsregisternummer</label>
                <input
                  type="text"
                  value={formData.hrb}
                  onChange={(e) => setFormData({ ...formData, hrb: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                  placeholder="z. B. HRB 123456"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface font-medium">Primäre Branche &amp; Erlebnis-Kategorie</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = formData.category === cat.label;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.label })}
                      className={`px-space-md py-1.5 rounded-full font-label-sm shadow-sm flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary font-semibold'
                          : 'bg-surface-container text-on-secondary-container hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-on-surface font-medium">Kurzbeschreibung für Sponti-App</label>
                <span className="font-body-sm text-on-surface-variant">{formData.description.length} / 300 Zeichen</span>
              </div>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all resize-none"
                placeholder="Beschreibe die Besonderheiten deines Angebots für spontane Gäste..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Offizielle Website</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                    language
                  </span>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-9 pr-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Instagram Handle</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                    alternate_email
                  </span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full pl-9 pr-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                    placeholder="studio.brand"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Hauptstandort & Geodaten */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-title-md font-bold">
                  2
                </span>
                <div>
                  <h2 className="font-title-md text-on-surface font-bold text-base">Hauptstandort &amp; Geodaten</h2>
                  <p className="font-body-sm text-on-surface-variant">Lage, Einzugsgebiet und spontane Zugangsbedingungen</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm font-semibold">
                Metropolregion
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Straße &amp; Hausnummer</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">PLZ &amp; Ort</label>
                <input
                  type="text"
                  value={formData.zipCity}
                  onChange={(e) => setFormData({ ...formData, zipCity: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Metropol-Cluster / Stadtbezirk</label>
                <select
                  value={formData.districtCluster}
                  onChange={(e) => setFormData({ ...formData, districtCluster: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                >
                  <option>München - Glockenbach / Isarvorstadt</option>
                  <option>München - Schwabing / Maxvorstadt</option>
                  <option>Berlin - Mitte / Kreuzberg</option>
                  <option>Hamburg - Sternschanze / Altona</option>
                  <option>Köln - Belgisches Viertel</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Check-in Instruktionen für Sponti-Nutzer</label>
                <input
                  type="text"
                  value={formData.checkInInstructions}
                  onChange={(e) => setFormData({ ...formData, checkInInstructions: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Integrated Map Preview */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-inner border border-surface-container">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrcj154UEZXsEsDLhg0xOc9I96vPSns2evCiiUqS71b6ucUNIcWQYdiPc_x72V603UM-aIf5tbevYgTjJicXHM9-gjwIjxO3iMGwv65g3zIDw1q5r5Yt0EGG2KLf88zIuhrxR3IsiVAZsTh0vwtj-fbI-YTEsUah8B1RXC7oiNiDPzVbWnnl0a8B53FOynBGPwxs_MGp8hnT1klBKfzB_J260AKOh3nkxmYnB_436bcuK2NWDht7kBSw')`
                }}
              ></div>
              <div className="absolute bottom-2.5 left-2.5 bg-surface-container-lowest/95 backdrop-blur-md px-space-sm py-1.5 rounded-lg flex items-center gap-2 shadow-sm border border-surface-container">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-on-surface font-semibold">
                  Geo-Koordinaten verifiziert: 48.1319° N, 11.5714° E ({formData.districtCluster})
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Ansprechpartner & Kontakt */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-title-md font-bold">
                  3
                </span>
                <div>
                  <h2 className="font-title-md text-on-surface font-bold text-base">Ansprechpartner &amp; Betriebsführung</h2>
                  <p className="font-body-sm text-on-surface-variant">Direkter Kontakt für Koordination, Support und Abrechnung</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-secondary-container font-label-sm font-semibold">
                Vertragspartner
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Hauptansprechpartner (Name)</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Funktion / Rolle</label>
                <input
                  type="text"
                  value={formData.contactRole}
                  onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Geschäftliche E-Mail</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Telefon / Mobilfunk</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface flex items-center justify-between font-medium">
                  Abweichende Rechnungs-E-Mail (optional)
                  <span className="text-on-surface-variant font-body-sm">Für PDF-Gutschriften &amp; Buchhaltung</span>
                </label>
                <input
                  type="email"
                  value={formData.invoiceEmail}
                  onChange={(e) => setFormData({ ...formData, invoiceEmail: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Kooperationsmodell & Check-in Setup */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-title-md font-bold">
                  4
                </span>
                <div>
                  <h2 className="font-title-md text-on-surface font-bold text-base">Kooperationsmodell &amp; Check-in Setup</h2>
                  <p className="font-body-sm text-on-surface-variant">Provisionsmodell, Auszahlungszyklen und Validierung am POS</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm font-semibold">
                B2B Core
              </span>
            </div>

            {/* Partnership Tier Radio Cards */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface font-medium">Partnerschaftsstufe &amp; Provisionssatz</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                {/* Standard */}
                <label
                  onClick={() => setFormData({ ...formData, tier: 'Standard' })}
                  className={`cursor-pointer rounded-xl p-space-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden border ${
                    formData.tier === 'Standard'
                      ? 'bg-primary-container/10 border-primary ring-1 ring-primary'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-title-md text-on-surface font-semibold">Standard</span>
                    <input
                      type="radio"
                      name="tier"
                      checked={formData.tier === 'Standard'}
                      onChange={() => setFormData({ ...formData, tier: 'Standard' })}
                      className="accent-primary w-4 h-4 mt-1"
                    />
                  </div>
                  <div>
                    <div className="font-headline-sm text-on-surface font-bold">15%</div>
                    <div className="font-body-sm text-on-surface-variant">Reguläre Vermittlungsprovision pro Gast</div>
                  </div>
                  <span className="font-label-sm text-on-surface-variant">Monatlich kündbar</span>
                </label>

                {/* Premium Partner (Empfohlen) */}
                <label
                  onClick={() => setFormData({ ...formData, tier: 'Premium Partner' })}
                  className={`cursor-pointer rounded-xl p-space-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden border-2 ${
                    formData.tier === 'Premium Partner'
                      ? 'bg-primary-container/10 border-primary shadow-sm'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <span className="absolute top-2 right-2 bg-primary text-on-primary font-label-sm px-2 py-0.5 rounded-full uppercase font-bold">
                    Empfohlen
                  </span>
                  <div className="flex items-start justify-between">
                    <span className="font-title-md text-on-surface font-bold">Premium Partner</span>
                    <input
                      type="radio"
                      name="tier"
                      checked={formData.tier === 'Premium Partner'}
                      onChange={() => setFormData({ ...formData, tier: 'Premium Partner' })}
                      className="accent-primary w-4 h-4 mt-1"
                    />
                  </div>
                  <div>
                    <div className="font-headline-sm text-primary font-bold">10%</div>
                    <div className="font-body-sm text-on-surface-variant">Inkl. Top-Placement in &quot;Entdecken&quot; &amp; Push-Slots</div>
                  </div>
                  <span className="font-label-sm text-primary font-semibold">12 Monate Bindung</span>
                </label>

                {/* Pilot Beta */}
                <label
                  onClick={() => setFormData({ ...formData, tier: 'Pilot Beta' })}
                  className={`cursor-pointer rounded-xl p-space-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden border ${
                    formData.tier === 'Pilot Beta'
                      ? 'bg-primary-container/10 border-primary ring-1 ring-primary'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-title-md text-on-surface font-semibold">Pilot Beta</span>
                    <input
                      type="radio"
                      name="tier"
                      checked={formData.tier === 'Pilot Beta'}
                      onChange={() => setFormData({ ...formData, tier: 'Pilot Beta' })}
                      className="accent-primary w-4 h-4 mt-1"
                    />
                  </div>
                  <div>
                    <div className="font-headline-sm text-on-surface font-bold">5%</div>
                    <div className="font-body-sm text-on-surface-variant">Early Mover Sonderkontingent (3 Monate)</div>
                  </div>
                  <span className="font-label-sm text-tertiary font-semibold">Nur mit Freigabe</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
              {/* Auszahlungsintervall */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Standard-Auszahlungsintervall</label>
                <div className="flex rounded-lg bg-surface-container-low p-1 gap-1 border border-surface-container">
                  {(['Wöchentlich', '14-tägig', 'Monatlich'] as const).map((interval) => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setFormData({ ...formData, payoutInterval: interval })}
                      className={`flex-1 py-1.5 rounded-md font-label-sm text-center transition-all ${
                        formData.payoutInterval === interval
                          ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check-in Methode */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Sponti Check-in System</label>
                <select
                  value={formData.checkInSystem}
                  onChange={(e) => setFormData({ ...formData, checkInSystem: e.target.value })}
                  className="w-full px-space-md py-2.5 bg-surface-container-low rounded-lg font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                >
                  <option>Partner-App Scanner (iOS / Android Smartphone)</option>
                  <option>QR-Code Aufsteller (Gäste scannen mit Sponti-App)</option>
                  <option>Kassensystem-API Integration (Direktübertragung)</option>
                  <option>Manuelle Gast-Code Eingabe im Dashboard</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Progress Tracker, Live App Preview & Media Assets (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Onboarding Progress Tracker Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span className="font-label-md text-on-surface font-bold">Onboarding-Status</span>
              </div>
              <span className="font-label-sm text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full font-bold">
                {formData.hasBusinessLicense ? '100% vollständig' : '75% vollständig'}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full transition-all duration-500"
                style={{ width: formData.hasBusinessLicense ? '100%' : '75%' }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1 font-body-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5 text-tertiary font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="text-on-surface">Stammdaten erfasst</span>
              </div>
              <div className="flex items-center gap-1.5 text-tertiary font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="text-on-surface">Logo &amp; Header da</span>
              </div>
              <div className="flex items-center gap-1.5 text-tertiary font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="text-on-surface">Kontakte hinterlegt</span>
              </div>
              <div
                onClick={() => setFormData({ ...formData, hasBusinessLicense: !formData.hasBusinessLicense })}
                className={`flex items-center gap-1.5 font-medium cursor-pointer ${
                  formData.hasBusinessLicense ? 'text-tertiary' : 'text-error'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {formData.hasBusinessLicense ? 'check_circle' : 'pending'}
                </span>
                <span>{formData.hasBusinessLicense ? 'Gewerbenachweis da' : 'Gewerbenachweis fehlt'}</span>
              </div>
            </div>
          </div>

          {/* Live App Preview Widget */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">smartphone</span>
                <span className="font-title-md text-on-surface font-bold">Live-Vorschau Sponti-App</span>
              </div>
              <span className="font-label-sm text-outline uppercase tracking-wider font-semibold">Endkundenansicht</span>
            </div>

            {/* Phone Card Mockup (Dynamically updates with form inputs!) */}
            <div className="bg-surface-container-low rounded-2xl p-space-sm flex flex-col gap-space-xs shadow-inner border border-surface-container/60">
              <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  alt="Storefront Banner Preview"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKhrOKyhdYl_40lRUj9TMfHuCEK5OtHuSDKPbqVHwuQoSpYeUsmoEufbP0VnlG97j_zn-s89e6lji9WY09zUSXeXKLtPfJN5GgG7siXWGTdL8Ci0ThXVAnFCNyFO4kWVTU5mLkD_x7jX6faeefL7Spmc6mKcSyO1Hpwx7_mgls_H-UwsFZB0uqDXNQRSja0x1WeJK24CZEBPlCmtne3oSc2RzLoUXJydkIzS1ERY7rF6qTVnC5Vifb5w"
                />
                <div className="absolute top-2.5 left-2.5 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">palette</span>
                  <span className="font-label-sm text-on-surface font-semibold">{formData.category}</span>
                </div>
                <div className="absolute top-2.5 right-2.5 bg-primary px-2 py-0.5 rounded-full font-label-sm text-on-primary font-bold">
                  NEU AUF SPONTI
                </div>
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest p-1 shadow-md">
                    <img
                      className="w-full h-full object-cover rounded-md"
                      alt="Logo"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXKW4MiXJ3U809xERKjJRBMEOlKvt6_GJ1VHlnXtdAClDKrz2bpKr_yKOkX5QIqUexXBQUwvawuZzCx_EEiJFUPIrEXDJws6cADQsq3JLAFYMGWooPIWcL7X4HOjR60xn2iFyBUcGTy3Y-gXRI-Nd_aN9rksQH1phSo6EkdZzIJQz5RABu_zNHxkmvjLbto3epuZ76VB50DZTOlyweklR8DTzrs33D37XX4YJxPyXXGX1woke-Kf6WAQ"
                    />
                  </div>
                </div>
              </div>

              <div className="px-1 py-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-title-md text-on-surface font-bold leading-tight">
                    {formData.name || 'Neuer Partner'}
                  </h3>
                  <div className="flex items-center gap-0.5 text-on-surface font-label-md font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-amber-500 fill-1">star</span>
                    <span className="font-bold">Neu</span>
                  </div>
                </div>
                <p className="font-body-sm text-on-surface-variant line-clamp-2">
                  {formData.description || 'Kurzbeschreibung für App-Nutzer.'}
                </p>
                <div className="flex items-center gap-3 pt-1 text-on-surface-variant font-body-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    München · 850m entfernt
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-tertiary">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Spontan verfügbar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Brand & Media Assets Uploads */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div>
                <h2 className="font-title-md text-on-surface font-bold text-base">Marken- &amp; Medien-Assets</h2>
                <p className="font-body-sm text-on-surface-variant">Visuals für die Entdecken-Feeds und Detailseiten</p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-outline">photo_library</span>
            </div>

            {/* Logo Upload Card */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface flex items-center justify-between font-semibold">
                Unternehmens-Logo
                <span className="text-on-surface-variant font-body-sm">1:1 Format (min. 400x400px)</span>
              </label>
              <div className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low border border-surface-container/60">
                <div className="w-16 h-16 rounded-xl bg-surface-container-lowest shrink-0 overflow-hidden shadow-sm flex items-center justify-center relative group">
                  <img
                    className="w-full h-full object-cover"
                    alt="Logo preview"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8Yw4D47HhVqlMXLp3NRaOhXEvInv5Q6LS2L56RlNCU9ra-0HO_qSZCJPLWD5io1JJkcKqiskghGsF95-1rJPX351nUcjFOymIS3S3glxbzb-Kf6AZfuv-ADrVnjTVvpTyFvImXKxfGBlW_dM0p2g7LDZozbY1N-m2OvHhSdQtqrIlzX66Y5btB1OeOC9Z4ObT7y46CiobkSaFYs381NlTr55eAJKwjMIvnZtKfY9j8y47_eLllDABjw"
                  />
                  <div className="absolute inset-0 bg-inverse-surface/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-on-surface truncate font-semibold">urban-craft-logo-final.svg</span>
                  <span className="font-body-sm text-tertiary flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">check</span> 142 KB · Erfolgreich hochgeladen
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Logo ausgetauscht')}
                  className="p-2 text-outline hover:text-error transition-colors"
                  title="Entfernen"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>

            {/* Storefront Hero Banner Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface flex items-center justify-between font-semibold">
                Titelbild / Storefront Banner
                <span className="text-on-surface-variant font-body-sm">16:9 Querformat (1920x1080px)</span>
              </label>
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-container-low group border border-surface-container/60">
                <img
                  className="w-full h-full object-cover"
                  alt="Banner preview"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgV_bRI_mVvgoUPU2pen7q16vXAydBik9TkcLNAI_8r-h8vBtu_W2kmCyL24x-2aQJUvVIPn-RCSlvQZ3M2vtgzdQvPw_5UlO1YjERnA17eFt94LwnWcQaTkLkbcm37RbivqcNeISGt9FSQYwR3PMp6ph-9SgQELGNCEOOfUABj13-rMdnEjyEmN0GVNd1p8IshWpSybrGPp8y3SR5UoFYjgIwpT_9fcGptsED_G6glW5Ojz8nF69vMQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 justify-between">
                  <span className="text-white font-label-sm flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[16px]">image</span> studio-hero-summer-2024.jpg
                  </span>
                  <button
                    type="button"
                    onClick={() => alert('Neues Titelbild auswählen')}
                    className="px-2.5 py-1 rounded-md bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface font-label-sm backdrop-blur transition-all font-semibold"
                  >
                    Ersetzen
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Photos Strip */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface flex items-center justify-between font-semibold">
                Galerie-Fotos (3 von max. 5 hochgeladen)
                <span
                  onClick={() => alert('Foto-Upload Dialog geöffnet')}
                  className="text-primary font-label-sm cursor-pointer hover:underline font-bold"
                >
                  + Foto hinzufügen
                </span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div className="relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Gallery 1"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvJ4QTOcrVwPvHTN9naqUycqTuFf9eaEj7WXfugknpvoW8QdqU2tcwIkt6Bmo8UrUtWVygu1yQFbdDRhRDwJvgKQr411_1uFfFJT4AAaSzZw7WMiM9V6sbemWpCuQ-UIRlC3oS0WyOWUlcUT9rcTGgdF3u8hq4tVWoSdza9SEjWm8jbKRomobUa9TG_rm7jtndPas-ginYt4KEkpO3eM7PfNfcyFXUBmwbnZqoBPxuqvoftrGR8O9enQ"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Gallery 2"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuZMs1YoPBkrqwpQHnQz_yMZhCRMJN7VzPt9hIouKwPto4vFQ-oZp8rNye9Fwull447c0fE55fPpBRyk4QRJZ-C4iiCjjkJlBuKEZHo7ZQ7Hzk5w8kacy5GlKVwnVPgx7AedryWA-9J-yxk6Lzx2vGq4gv6JF8Tx2KoKHuhyoqB5eWYkwSPow0YT8ck-rrg9tRBacwpAVJYQyh26Ym1qX6SlF101autHmUg2zpuwlgLNV1xK4Nr0yM0g"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Gallery 3"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYVaxzHB449zBG1XnESJYMPwq5dV0P63xeh7z9nU86-dkVhwpQ0ggk_fKcZFPK961jjt0yr9Esl3ggoA2JNMjUVZrSU3-yWdivhELbG4k4IpY1knuwtgGThF0aYOqk5DODPLN1Rnhgxe0Yfi89bxYorOqzrXMYMsSaQO6S6gF2cK_HXXtTL3Isdf35ZMRugqNjK4aBAbGhACSEVk1X1l_Yv8_rYGWbUo6LcV2YLzcfAkAi9DNCbTgRmg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Foto-Upload Dialog geöffnet')}
                  className="aspect-square rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center text-outline hover:text-primary gap-1 border border-dashed border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
                  <span className="font-label-sm font-semibold">Upload</span>
                </button>
              </div>
            </div>

            {/* Section: Verifizierungsdokumente */}
            <div className="flex flex-col gap-1.5 pt-space-xs border-t border-surface-container">
              <label className="font-label-md text-on-surface flex items-center justify-between font-semibold">
                Gewerbenachweis &amp; Handelsregister
                <span className={`font-label-sm font-bold ${formData.hasBusinessLicense ? 'text-tertiary' : 'text-error'}`}>
                  {formData.hasBusinessLicense ? 'Hochgeladen' : 'Ausstehend'}
                </span>
              </label>
              <div
                onClick={() => setFormData({ ...formData, hasBusinessLicense: !formData.hasBusinessLicense })}
                className="p-space-md rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-surface-container transition-all border border-surface-container/60"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.hasBusinessLicense ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-highest text-primary'}`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {formData.hasBusinessLicense ? 'verified' : 'shield_person'}
                  </span>
                </div>
                <div>
                  <span className="font-title-md text-on-surface font-semibold">
                    {formData.hasBusinessLicense ? 'Gewerbeanmeldung_2024.pdf hinterlegt' : 'Gewerbeanmeldung hochladen'}
                  </span>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    {formData.hasBusinessLicense
                      ? 'Dokument verschlüsselt und zur Prüfung freigegeben.'
                      : 'PDF oder PNG (max. 15 MB). Wird verschlüsselt gespeichert und nur zur Verifikation genutzt.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md shadow-sm hover:bg-surface-container transition-all mt-1 font-semibold"
                >
                  {formData.hasBusinessLicense ? 'Dokument ersetzen' : 'Dokument auswählen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Confirmation Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-space-md lg:px-space-xl flex items-center justify-between z-40 border-t border-surface-container-low">
        <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm">
          <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
          <span className="hidden sm:inline">Alle Änderungen werden automatisch als Entwurf zwischengespeichert.</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => onNavigate('unternehmen-und-partner')}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md transition-colors font-medium"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md transition-colors font-semibold"
          >
            Entwurf sichern
          </button>
          <button
            type="button"
            onClick={handleCreateFinal}
            className="px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md transition-all flex items-center gap-1.5 shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>Partnerunternehmen final anlegen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
