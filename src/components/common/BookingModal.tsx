import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  MessageSquare, 
  X, 
  Sparkles
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultLocation?: string;
  defaultDescription?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = 'Property Inspection & Study Milestone',
  defaultLocation = 'Lekki Phase 1 Duplex / Virtual Session',
  defaultDescription = 'Inspection & long-term consultation appointment scheduled via Studyforge.'
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [title, setTitle] = useState(defaultTitle);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60'); // minutes
  const [location, setLocation] = useState(defaultLocation);
  const [notes, setNotes] = useState(defaultDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate min and max dates (Today to 12 months ahead)
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const presetTimes = [
    { label: '09:00 AM', value: '09:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '02:00 PM', value: '14:00' },
    { label: '04:00 PM', value: '16:00' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API persistence & booking processing
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 600);
  };

  // Format dates for iCal / Google Calendar (UTC YYYYMMDDTHHmmssZ)
  const getUtcTimestamps = () => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      
      const startDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const endDate = new Date(startDate.getTime() + parseInt(duration) * 60000);

      const formatDateToICal = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      return {
        start: formatDateToICal(startDate),
        end: formatDateToICal(endDate)
      };
    } catch {
      // Fallback
      const now = new Date();
      const start = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = new Date(now.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return { start, end };
    }
  };

  const { start, end } = getUtcTimestamps();

  // 1. Google Calendar Link
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}&details=${encodeURIComponent(notes)}&location=${encodeURIComponent(location)}`;

  const handleGoogleCalendar = () => {
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Apple / Outlook .ics file generator
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Studyforge Inspection Booking//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@studyforge.app`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${notes.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_appointment.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // 3. WhatsApp Confirmation Link
  const whatsappMessage = `Hello! My appointment/inspection has been successfully booked:\n\n📌 *${title}*\n📅 Date: ${date} at ${time}\n📍 Location: ${location}\n📝 Notes: ${notes}\n\nConfirmed via Studyforge.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {step === 'form' ? 'Schedule Inspection & Long-Term Booking' : 'Booking Confirmed!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'form' ? 'Pick a date up to 12 months ahead & sync calendars' : 'Your appointment is saved and ready to sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Appointment Title / Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Property Inspection: Lekki Duplex"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Scheduled Date (Up to 1 Year Ahead)
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    max={maxDateStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Valid from today up to 12 months ahead.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    Time Slot
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {/* Preset quick times */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {presetTimes.map((pt) => (
                      <button
                        key={pt.value}
                        type="button"
                        onClick={() => setTime(pt.value)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all ${
                          time === pt.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Location / Link
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Lekki Phase 1 / Zoom Link"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="90">1.5 Hours</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Notes & Details
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add inspection checklist items or study milestone goals..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Book Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Booking Confirmed Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Your appointment has been securely persisted. Sync it instantly with your preferred calendar or notify via WhatsApp.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Title:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Date & Time:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{date} at {time} ({duration}m)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[240px]">{location}</span>
                </div>
              </div>

              {/* Dual-Calendar Sync Buttons */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Dual-Calendar Syncing
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Google Calendar */}
                  <button
                    onClick={handleGoogleCalendar}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-800 dark:text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">G</div>
                    <span>Add to Google Calendar</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>

                  {/* Apple / Outlook .ics download */}
                  <button
                    onClick={handleDownloadIcs}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-800 dark:text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">📅</div>
                    <span>Apple / Outlook (.ics)</span>
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>
                </div>

                {/* WhatsApp secondary action */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Confirmation to WhatsApp</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => setStep('form')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  ← Book Another Appointment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
