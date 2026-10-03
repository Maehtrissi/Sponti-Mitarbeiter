import React from 'react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
            <span>B2B Controlling</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Performance &amp; Umsatz</span>
          </div>
          <h1 className="font-headline-lg text-on-surface tracking-tight mt-1">
            Analysen, Reports &amp; Buchungsströme
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Umsatzvolumen, Sponti Pay Provisionsabrechnungen und regionale Auslastungsanalysen im Überblick.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-label-md hover:bg-surface-container transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Letzte 30 Tage</span>
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-lg font-title-md hover:bg-primary-container transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Report generieren (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
          <span className="font-label-sm text-outline uppercase font-semibold">Gesamter vermittelter GMV</span>
          <div className="font-headline-lg text-on-surface mt-1 font-bold">€384.200</div>
          <span className="font-label-sm text-tertiary font-bold flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +22.1% MoM
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
          <span className="font-label-sm text-outline uppercase font-semibold">Sponti B2B Provision (Ø 11%)</span>
          <div className="font-headline-lg text-primary mt-1 font-bold">€42.262</div>
          <span className="font-label-sm text-tertiary font-bold flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +18.4% MoM
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
          <span className="font-label-sm text-outline uppercase font-semibold">Erfolgreiche Buchungsslots</span>
          <div className="font-headline-lg text-on-surface mt-1 font-bold">14.920</div>
          <span className="font-body-sm text-outline mt-1 block">Ø 3.2 Min. bis Bestätigung</span>
        </div>
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
          <span className="font-label-sm text-outline uppercase font-semibold">Spontan-Impuls Conversion</span>
          <div className="font-headline-lg text-tertiary mt-1 font-bold">94.8%</div>
          <span className="font-body-sm text-outline mt-1 block">Innerhalb 2 Std. vor Slot</span>
        </div>
      </div>

      {/* Regional Performance & Revenue Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* City Breakdown Chart Mockup */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
            <div>
              <h3 className="font-title-md text-on-surface font-bold text-base">Metropolregionen &amp; Buchungsdynamik</h3>
              <p className="font-body-sm text-on-surface-variant">Verteilung des monatlichen Buchungsvolumens nach Standorten</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold">
              Live Aggregate
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-label-md mb-1">
                <span className="text-on-surface font-semibold">München (54 Partner)</span>
                <span className="text-primary font-bold">€158.400 (41%)</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '41%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-md mb-1">
                <span className="text-on-surface font-semibold">Berlin (48 Partner)</span>
                <span className="text-tertiary font-bold">€122.900 (32%)</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-md mb-1">
                <span className="text-on-surface font-semibold">Hamburg (28 Partner)</span>
                <span className="text-secondary font-bold">€61.500 (16%)</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-md mb-1">
                <span className="text-on-surface font-semibold">Köln (18 Partner)</span>
                <span className="text-outline font-bold">€41.400 (11%)</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-outline rounded-full" style={{ width: '11%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-space-md border-t border-surface-container grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-surface-container-low">
              <span className="font-label-sm text-outline">Höchste Auslastung</span>
              <div className="font-title-md text-on-surface font-bold">Klettern &amp; Boulder (96%)</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low">
              <span className="font-label-sm text-outline">Bester Payout-Schnitt</span>
              <div className="font-title-md text-on-surface font-bold">Gastronomie (€28 / Gast)</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low">
              <span className="font-label-sm text-outline">Spitzenzeit für Deals</span>
              <div className="font-title-md text-on-surface font-bold">17:00 - 20:30 Uhr</div>
            </div>
          </div>
        </div>

        {/* Top Earners / Partners Ranking */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-sm">
          <div className="pb-space-xs border-b border-surface-container">
            <h3 className="font-title-md text-on-surface font-bold">Top Partner nach Umsatz</h3>
            <p className="font-body-sm text-on-surface-variant">Monatlich vermittelte Tickets</p>
          </div>
          <div className="space-y-3 mt-2">
            {[
              { rank: 1, name: 'Urban Bouldering Hub', city: 'Berlin', gmv: '€48.200', count: 342 },
              { rank: 2, name: 'Rooftop Lounge 360', city: 'Köln', gmv: '€39.800', count: 418 },
              { rank: 3, name: 'Café Spontan', city: 'München', gmv: '€24.100', count: 215 },
              { rank: 4, name: 'Paddle & Surf Club', city: 'München', gmv: '€19.600', count: 176 },
              { rank: 5, name: 'Urban Peak Boulder', city: 'München', gmv: '€18.200', count: 310 }
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm font-bold text-primary">
                    {item.rank}
                  </span>
                  <div>
                    <div className="font-label-md text-on-surface font-semibold">{item.name}</div>
                    <div className="font-body-sm text-on-surface-variant">{item.city} • {item.count} Buchungen</div>
                  </div>
                </div>
                <span className="font-title-md text-on-surface font-bold">{item.gmv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
