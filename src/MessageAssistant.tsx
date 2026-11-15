import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { XCircle, Sparkles, Copy, Check, MessageCircle, RefreshCw } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { BUSINESS } from '../api/_lib/business';

interface Props {
  /** The reservation the message is about, or null for a new lead with no booking yet. */
  reservation: any | null;
  onClose: () => void;
}

const LANGUAGES = [
  { value: 'auto', label: "Customer's language" },
  { value: 'English', label: 'English' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Spanish', label: 'Spanish' },
];

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-electric placeholder:text-silver/40';

export default function MessageAssistant({ reservation, onClose }: Props) {
  const [conversation, setConversation] = useState('');
  const [instruction, setInstruction] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [language, setLanguage] = useState('auto');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [saveWarning, setSaveWarning] = useState('');
  const [copied, setCopied] = useState(false);

  const portalLink = reservation
    ? `${window.location.origin}/dashboard/${reservation.id}`
    : '';

  // Load what was saved for this customer last time.
  useEffect(() => {
    if (!reservation) return;
    let cancelled = false;
    getDoc(doc(db, 'assistantThreads', reservation.id))
      .then((snap) => {
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        setConversation(data.conversation || '');
        setPaymentLink(data.paymentLink || '');
        setDraft(data.lastDraft || '');
      })
      .catch((e) => console.warn('Could not load saved conversation:', e));
    return () => {
      cancelled = true;
    };
  }, [reservation?.id]);

  const saveThread = async (lastDraft: string) => {
    if (!reservation) return;
    try {
      await setDoc(doc(db, 'assistantThreads', reservation.id), {
        conversation,
        paymentLink,
        lastDraft,
        updatedAt: new Date(),
      });
      setSaveWarning('');
    } catch (e) {
      console.warn('Could not save conversation:', e);
      setSaveWarning('Draft generated, but not saved to this customer (deploy the updated firestore.rules).');
    }
  };

  const generate = async (revise: boolean) => {
    if (!instruction.trim()) {
      setError('Tell the assistant what the message should say.');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const resp = await fetch('/api/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          conversation,
          instruction,
          paymentLink,
          portalLink,
          language,
          previousDraft: revise ? draft : undefined,
          customer: reservation
            ? {
                fullName: reservation.fullName,
                date: reservation.date,
                sessionTime: reservation.sessionTime,
                location: reservation.location,
                experience: reservation.experience,
                wetsuitSize: reservation.wetsuitSize,
                depositPaid: !!reservation.depositPaid,
                healthDone: reservation.healthStatus === 'fit',
                waiverDone: reservation.waiverStatus === 'signed',
                experienceDone: !!reservation.riderExperience,
                schoolDone: !!reservation.flightSchool,
              }
            : null,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || `Request failed (${resp.status})`);
      setDraft(data.reply);
      await saveThread(data.reply);
    } catch (e: any) {
      setError(e.message || 'Failed to generate the message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phoneDigits = (reservation?.phone || '').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(draft)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-navy border border-white/10 rounded-2xl p-6 max-w-5xl w-full my-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-display font-bold uppercase flex items-center gap-2">
              <Sparkles size={20} className="text-electric" /> Message Assistant
            </h2>
            <p className="text-sm text-silver/70 mt-1">
              {reservation
                ? `${reservation.fullName} · ${reservation.date} · ${BUSINESS.timeSlots[reservation.sessionTime] || reservation.sessionTime} · ${reservation.location} · Deposit ${reservation.depositPaid ? 'paid' : 'pending'}`
                : 'New lead, no booking yet. Create the customer first to include their link.'}
            </p>
          </div>
          <button onClick={onClose} className="text-silver hover:text-white" aria-label="Close">
            <XCircle size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input side */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-silver mb-1">WhatsApp conversation</label>
              <textarea
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                placeholder="Paste the chat with the customer here..."
                rows={9}
                className={inputClass}
              />
            </div>

            {reservation && (
              <div>
                <label className="block text-sm text-silver mb-1">Payment link</label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-silver mb-1">What should the message say?</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {BUSINESS.quickInstructions.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setInstruction(q.instruction)}
                    className="px-3 py-1.5 text-xs rounded-full border border-white/10 bg-white/5 text-silver hover:text-white hover:border-electric transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. tell them Saturday morning works, send the link and the deposit details"
                rows={4}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`${inputClass} appearance-none sm:w-52`}
                aria-label="Reply language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value} className="bg-navy">
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => generate(false)}
                disabled={isGenerating}
                className="flex-1 py-3 bg-electric text-navy font-bold rounded-xl text-sm hover:bg-electric/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Sparkles size={16} /> {isGenerating ? 'Writing...' : 'Write message'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
            )}
          </div>

          {/* Output side */}
          <div className="flex flex-col">
            <label className="block text-sm text-silver mb-1">Message to send (edit freely)</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="The drafted message appears here."
              className={`${inputClass} flex-1 min-h-[320px]`}
            />
            {saveWarning && <p className="text-xs text-yellow-400 mt-2">{saveWarning}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="button"
                onClick={copyDraft}
                disabled={!draft}
                className="flex-1 py-3 bg-white text-navy font-bold rounded-xl text-sm hover:bg-silver transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </button>
              {phoneDigits && (
                <a
                  href={draft ? whatsappUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-3 bg-[#25D366] text-navy font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${draft ? 'hover:bg-[#25D366]/90' : 'opacity-40 pointer-events-none'}`}
                >
                  <MessageCircle size={16} /> Open in WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => generate(true)}
                disabled={!draft || isGenerating}
                title="Applies the text in 'What should the message say?' as a change to this draft"
                className="py-3 px-4 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <RefreshCw size={16} /> Revise
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
