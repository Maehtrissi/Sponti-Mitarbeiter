import React, { useState } from 'react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (targetSegment: string, subject: string, text: string) => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  onSend
}) => {
  const [segment, setSegment] = useState('Alle Mitglieder (14.820)');
  const [channel, setChannel] = useState('Push-Benachrichtigung + In-App');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    onSend(segment, subject, message);
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">forward_to_inbox</span>
            <h3 className="font-title-md text-on-surface font-bold text-lg">Nachricht an Mitglieder-Segmente</h3>
          </div>
          <button type="button" onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface font-medium">Ziel-Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Alle Mitglieder (14.820)</option>
                <option>Premium Sponti-Club Gold (2.140)</option>
                <option>VIP / Vielnutzer (&gt; 20 Einlösungen)</option>
                <option>Inaktive Nutzer (&gt; 30 Tage)</option>
                <option>Studenten-Accounts</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface font-medium">Kanal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Push-Benachrichtigung + In-App</option>
                <option>Nur Push-Benachrichtigung</option>
                <option>E-Mail Newsletter</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Betreff / Headline</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z.B. Spontanes Wochenend-Special: Bouldern & Café Deals"
              className="px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface font-medium">Nachrichtentext</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Schreibe deinen Text für die ausgewählte Zielgruppe..."
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
              Segment jetzt benachrichtigen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
