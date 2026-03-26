import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Slot, ViewMode } from '@/types';
import { useAppContext } from '@/Context/AppContext';
import { getMockSlots } from '@/Components/Scheduler/mockData';
import { isSameDay, getWeekDates, parseSlotDate } from '@/Components/Scheduler/utils';
import FilterBar from '@/Components/Scheduler/FilterBar';
import MonthView from '@/Components/Scheduler/MonthView';
import WeekView from '@/Components/Scheduler/WeekView';
import ListView from '@/Components/Scheduler/ListView';
import DayDetailPanel from '@/Components/Scheduler/DayDetailPanel';
import BookingConfirmation from '@/Components/Scheduler/BookingConfirmation';

// ── Format legend data ──────────────────────────────────────────────────────
const LEGEND_FORMATS = ['Soirée', 'Journalier', 'Journée et soirée', 'Voyage à Vie à bord'];
const FORMAT_LEGEND_COLORS: Record<string, string> = {
    'Soirée':             '#a78bfa',
    'Journalier':         '#38bdf8',
    'Journée et soirée':  '#34d399',
    'Voyage à Vie à bord':'#fb923c',
};

export default function SchedulerPage() {
    const { user, token } = useAppContext();

    // ── Navigation state ──────────────────────────────────────────────────
    const [currentMonth, setCurrentMonth] = useState(5);   // 0-indexed: June
    const [currentYear,  setCurrentYear]  = useState(2026);
    const [weekBase, setWeekBase] = useState(() => new Date(2026, 5, 7));

    // ── UI state ──────────────────────────────────────────────────────────
    const [viewMode,     setViewMode]     = useState<ViewMode>('month');
    const [filterFormat,    setFilterFormat]    = useState('all');
    const [filterType,      setFilterType]      = useState('all');
    const [filterWomenOnly, setFilterWomenOnly] = useState(false);
    const [selectedDay,  setSelectedDay]  = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [showConfirm,  setShowConfirm]  = useState(false);

    // ── Data state ────────────────────────────────────────────────────────
    const [slots,           setSlots]           = useState<Slot[]>([]);
    const [loading,         setLoading]         = useState(true);
    const [error,           setError]           = useState<string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const userNiveau = user?.niveau ?? 1;
    const isAdmin    = user?.role === 'admin';

    // Allows admin to override niveau for testing
    const [niveauOverride, setNiveauOverride] = useState<number | null>(null);
    const activeNiveau = isAdmin && niveauOverride ? niveauOverride : userNiveau;

    // ── Data fetching ─────────────────────────────────────────────────────
    const fetchSlots = useCallback(async (month: number, year: number, niveau: string) => {
        setLoading(true);
        setError(null);
        try {
            // TODO: replace with real API call when backend is ready:
            // const res = await fetch(
            //   `/api/schedule/slots?month=${month + 1}&year=${year}&format=all&type=all`,
            //   { headers: { Authorization: `Bearer ${token}` } }
            // );
            // if (!res.ok) throw new Error('Erreur lors du chargement des créneaux.');
            // const json: SlotsApiResponse = await res.json();
            // setSlots(json.data);

            // Mock data (matches API response shape)
            await new Promise((r) => setTimeout(r, 300)); // simulate network
            const response = getMockSlots(month, year, niveau);
            setSlots(response.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSlots(currentMonth, currentYear, activeNiveau);
        setSelectedDay(null);
    }, [currentMonth, currentYear, activeNiveau]);

    // ── Derived/filtered slots ────────────────────────────────────────────
    const filteredSlots = useMemo(() => slots.filter((s) => {
        // Niveau filtering is server-side; client-side format/type/women filters only
        if (filterFormat    !== 'all' && s.format        !== filterFormat) return false;
        if (filterType      !== 'all' && s.type          !== filterType)   return false;
        if (filterWomenOnly && !s.women_sailing) return false;
        return true;
    }), [slots, filterFormat, filterType, filterWomenOnly]);

    const slotsThisMonth = useMemo(() =>
        filteredSlots.filter((s) => {
            const [y, m] = s.date.split('-').map(Number);
            return m - 1 === currentMonth && y === currentYear;
        }),
        [filteredSlots, currentMonth, currentYear],
    );

    const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);

    const slotsThisWeek = useMemo(() =>
        filteredSlots.filter((s) =>
            weekDates.some((wd) => isSameDay(wd, parseSlotDate(s.date, s.start_time)))
        ),
        [filteredSlots, weekDates],
    );

    const daySlots = useMemo(() => {
        if (!selectedDay) return [];
        const pool = viewMode === 'week' ? slotsThisWeek : slotsThisMonth;
        return pool.filter((s) => isSameDay(parseSlotDate(s.date, s.start_time), selectedDay));
    }, [selectedDay, viewMode, slotsThisWeek, slotsThisMonth]);

    const visibleCount = viewMode === 'week' ? slotsThisWeek.length : slotsThisMonth.length;

    // ── Navigation handlers ───────────────────────────────────────────────
    const prevMonth = () => setCurrentMonth((m) => { if (m === 0)  { setCurrentYear((y) => y - 1); return 11; } return m - 1; });
    const nextMonth = () => setCurrentMonth((m) => { if (m === 11) { setCurrentYear((y) => y + 1); return 0;  } return m + 1; });
    const prevWeek  = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); setSelectedDay(null); };
    const nextWeek  = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); setSelectedDay(null); };

    const handleViewChange = (v: ViewMode) => { setViewMode(v); setSelectedDay(null); };

    // ── Booking flow ──────────────────────────────────────────────────────
    const handleBook = (slot: Slot) => {
        setSelectedSlot(slot);
        setShowConfirm(true);
    };

    const handleCheckout = async (quantity: number) => {
        if (!selectedSlot) return;
        setCheckoutLoading(true);
        try {
            // TODO: replace with real API call:
            // const res = await fetch('/api/booking/checkout', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            //   body: JSON.stringify({ slot_id: selectedSlot.id, stripe_product_id: selectedSlot.stripe_product_id, quantity }),
            // });
            // if (res.status === 409) {
            //   setShowConfirm(false);
            //   setSelectedSlot(null);
            //   setError('Ce créneau est maintenant complet.');
            //   fetchSlots(currentMonth, currentYear, activeNiveau);
            //   return;
            // }
            // if (!res.ok) throw new Error('Impossible de créer la session de paiement.');
            // const { checkout_url } = await res.json();
            // window.location.href = checkout_url;

            await new Promise((r) => setTimeout(r, 1500)); // simulate
            alert(`[Mock] POST /api/booking/checkout\n{ slot_id: ${selectedSlot.id}, stripe_product_id: "${selectedSlot.stripe_product_id}", quantity: ${quantity} }\n\n→ Would redirect to Stripe Checkout`);
            setShowConfirm(false);
            setSelectedSlot(null);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Une erreur est survenue.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleCancelConfirm = () => { setShowConfirm(false); setSelectedSlot(null); };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen text-slate-200 relative overflow-hidden"
            style={{
                background: 'linear-gradient(165deg, #020617 0%, #0c1222 40%, #091520 100%)',
                fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
            }}
        >
            {/* Ambient glows */}
            <div className="fixed pointer-events-none" style={{ top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)' }} />
            <div className="fixed pointer-events-none" style={{ bottom: '-20%', left: '-10%',  width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)' }} />

            <div className="px-8 py-8 relative z-10">
                {/* Page header */}
                <div className="mb-7">
                    <div className="flex items-center gap-4 mb-1.5">
                        <h1
                            className="text-3xl font-bold m-0 tracking-tight"
                            style={{ background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        >
                            Réservation — Été 2026
                        </h1>
                    </div>
                    <p className="text-slate-500 text-lg m-0">
                        Sélectionnez une date pour voir les formules disponibles
                    </p>
                </div>

                {/* Filter bar */}
                <FilterBar
                    userNiveau={isAdmin && niveauOverride ? niveauOverride : userNiveau}
                    filterFormat={filterFormat}
                    filterType={filterType}
                    filterWomenOnly={filterWomenOnly}
                    viewMode={viewMode}
                    visibleCount={visibleCount}
                    isAdmin={isAdmin}
                    onFormatChange={setFilterFormat}
                    onTypeChange={setFilterType}
                    onWomenOnlyChange={setFilterWomenOnly}
                    onViewChange={handleViewChange}
                    onNiveauChange={setNiveauOverride}
                />

                {/* Error state */}
                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-950/40 border border-red-900/40">
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
                        <span className="animate-pulse">Chargement des créneaux…</span>
                    </div>
                )}

                {/* Main content */}
                {!loading && (
                    <div className="flex gap-6 flex-wrap">
                        {/* Left: calendar/list view */}
                        <div className="flex-1 min-w-[500px]">
                            {viewMode === 'month' && (
                                <MonthView
                                    year={currentYear}
                                    month={currentMonth}
                                    slots={slotsThisMonth}
                                    selectedDay={selectedDay}
                                    onDayClick={setSelectedDay}
                                    onPrevMonth={prevMonth}
                                    onNextMonth={nextMonth}
                                />
                            )}
                            {viewMode === 'week' && (
                                <WeekView
                                    weekBase={weekBase}
                                    slots={slotsThisWeek}
                                    selectedDay={selectedDay}
                                    onDayClick={setSelectedDay}
                                    onBook={handleBook}
                                    onPrevWeek={prevWeek}
                                    onNextWeek={nextWeek}
                                />
                            )}
                            {viewMode === 'list' && (
                                <ListView
                                    year={currentYear}
                                    month={currentMonth}
                                    slots={slotsThisMonth}
                                    onBook={handleBook}
                                    onPrevMonth={prevMonth}
                                    onNextMonth={nextMonth}
                                />
                            )}
                        </div>

                        {/* Right: detail / confirmation panel */}
                        <div className="w-[420px] min-w-[340px] flex flex-col gap-4">
                            {showConfirm && selectedSlot ? (
                                <BookingConfirmation
                                    slot={selectedSlot}
                                    loading={checkoutLoading}
                                    onConfirm={handleCheckout}
                                    onCancel={handleCancelConfirm}
                                />
                            ) : selectedDay !== null && daySlots.length > 0 ? (
                                <DayDetailPanel
                                    selectedDay={selectedDay}
                                    slots={daySlots}
                                    onBook={handleBook}
                                />
                            ) : (
                                <div
                                    className="rounded-2xl border border-dashed py-10 px-6 text-center"
                                    style={{ background: 'rgba(15,23,42,0.4)', borderColor: 'rgba(148,163,184,0.12)' }}
                                >
                                    <div className="text-4xl mb-3 opacity-40">
                                        {viewMode === 'week' ? '📆' : '📅'}
                                    </div>
                                    <p className="text-slate-600 text-sm m-0 leading-relaxed">
                                        {viewMode === 'week'
                                            ? 'Cliquez sur un créneau dans la grille horaire ou sur un jour pour voir les détails.'
                                            : 'Cliquez sur un jour avec des formules disponibles pour voir les détails et réserver.'}
                                    </p>
                                </div>
                            )}

                            {/* Format legend */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.06)' }}
                            >
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
                                    Légende des formats
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {LEGEND_FORMATS.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-sm opacity-80 shrink-0"
                                                style={{ background: FORMAT_LEGEND_COLORS[f] }}
                                            />
                                            <span className="text-sm text-slate-400">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data flow note (dev reference) */}
                            <div
                                className="p-3.5 rounded-xl text-xs leading-relaxed font-mono"
                                style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', color: '#818cf8' }}
                            >
                                <strong>Data flow:</strong><br />
                                GET /api/schedule/slots?month=&year=<br />
                                → Laravel joins DB slots + Stripe metadata<br />
                                POST /api/booking/checkout {'{ slot_id }'}<br />
                                → Stripe Checkout Session → redirect<br />
                                WEBHOOK checkout.session.completed<br />
                                → Confirm booking, decrement capacity
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
