import { useMemo } from 'react';
import type { Slot } from '@/types';
import { DAYS_SHORT, GRID_HOURS, isSameDay, getWeekDates, getFormatStyle, formatWeekLabel, parseSlotDate, padHour } from './utils';

type Props = {
    weekBase: Date;
    slots: Slot[];
    selectedDay: Date | null;
    onDayClick: (day: Date | null) => void;
    onBook: (slot: Slot) => void;
    onPrevWeek: () => void;
    onNextWeek: () => void;
};

export default function WeekView({ weekBase, slots, selectedDay, onDayClick, onBook, onPrevWeek, onNextWeek }: Props) {
    const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);

    // Build slot grid: key = "dayIndex-hour" → Slot[]
    const slotGrid = useMemo(() => {
        const g: Record<string, Slot[]> = {};
        slots.forEach((s) => {
            const slotDate = parseSlotDate(s.date, s.start_time);
            const dayIdx = weekDates.findIndex((wd) => isSameDay(wd, slotDate));
            if (dayIdx === -1) return;
            const hour = slotDate.getHours();
            const key = `${dayIdx}-${hour}`;
            if (!g[key]) g[key] = [];
            g[key].push(s);
        });
        return g;
    }, [slots, weekDates]);

    const activeHours = useMemo(() => {
        const hrs = new Set<number>();
        slots.forEach((s) => {
            const slotDate = parseSlotDate(s.date, s.start_time);
            if (weekDates.some((wd) => isSameDay(wd, slotDate))) {
                hrs.add(slotDate.getHours());
            }
        });
        return GRID_HOURS.filter((h) => hrs.has(h));
    }, [slots, weekDates]);

    const today     = new Date();
    const weekLabel = useMemo(() => formatWeekLabel(weekDates), [weekDates]);

    const navBtn = "bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 cursor-pointer text-sm hover:bg-slate-700 transition-colors";

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
            >
                <button onClick={onPrevWeek} className={navBtn}>←</button>
                <h2 className="m-0 text-base font-semibold text-slate-200">
                    Semaine du {weekLabel}
                </h2>
                <button onClick={onNextWeek} className={navBtn}>→</button>
            </div>

            {/* Day column headers */}
            <div
                className="grid"
                style={{ gridTemplateColumns: '64px repeat(7, 1fr)', borderBottom: '1px solid rgba(148,163,184,0.06)' }}
            >
                <div />
                {weekDates.map((wd, i) => (
                    <div
                        key={i}
                        className="text-center py-3 px-1"
                        style={{ borderLeft: '1px solid rgba(148,163,184,0.04)' }}
                    >
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            {DAYS_SHORT[i]}
                        </div>
                        <div
                            className="text-lg font-bold font-mono mt-0.5"
                            style={{ color: isSameDay(wd, today) ? '#38bdf8' : '#94a3b8' }}
                        >
                            {wd.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Time grid */}
            <div className="max-h-[520px] overflow-y-auto">
                {activeHours.length === 0 ? (
                    <div className="py-12 px-6 text-center text-slate-600 text-sm">
                        Aucune disponibilité cette semaine pour votre niveau.
                    </div>
                ) : activeHours.map((hour) => (
                    <div
                        key={hour}
                        className="grid min-h-[100px]"
                        style={{
                            gridTemplateColumns: '64px repeat(7, 1fr)',
                            borderBottom: '1px solid rgba(148,163,184,0.04)',
                        }}
                    >
                        {/* Hour label */}
                        <div
                            className="px-3 pt-3 text-sm font-semibold text-slate-500 font-mono flex items-start"
                            style={{ borderRight: '1px solid rgba(148,163,184,0.06)' }}
                        >
                            {padHour(hour)}h
                        </div>

                        {/* Day cells */}
                        {weekDates.map((wd, dayIdx) => {
                            const cellSlots   = slotGrid[`${dayIdx}-${hour}`] || [];
                            const isSelected  = selectedDay !== null && isSameDay(wd, selectedDay);
                            return (
                                <div
                                    key={dayIdx}
                                    onClick={() => {
                                        if (cellSlots.length > 0) {
                                            onDayClick(isSelected ? null : wd);
                                        }
                                    }}
                                    className="p-1 transition-colors duration-150"
                                    style={{
                                        borderLeft: '1px solid rgba(148,163,184,0.04)',
                                        cursor:     cellSlots.length > 0 ? 'pointer' : 'default',
                                        background: isSelected ? 'rgba(56,189,248,0.06)' : 'transparent',
                                    }}
                                >
                                    {cellSlots.map((s) => {
                                        const fc = getFormatStyle(s.format);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={(e) => { e.stopPropagation(); onBook(s); }}
                                                className="text-sm px-2 py-1.5 rounded mb-1 font-medium border cursor-pointer transition-transform duration-150 hover:scale-[1.03] leading-snug"
                                                style={{ background: fc.bg, color: fc.text, borderColor: fc.border, lineHeight: '1.4' }}
                                            >
                                                {s.product_name}
                                                <div className="opacity-70 mt-0.5 text-xs font-mono">
                                                    {s.spots_remaining}/{s.max_spots} places
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
