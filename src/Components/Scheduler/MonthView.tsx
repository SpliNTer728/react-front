import type { Slot } from '@/types';
import { MONTHS, DAYS_SHORT, getDaysInMonth, getFirstDayOfMonth, getFormatStyle } from './utils';

type Props = {
    year: number;
    month: number;
    slots: Slot[];
    selectedDay: Date | null;
    onDayClick: (day: Date | null) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
};

export default function MonthView({ year, month, slots, selectedDay, onDayClick, onPrevMonth, onNextMonth }: Props) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay    = getFirstDayOfMonth(year, month);

    // Group slots by day number
    const slotsByDay: Record<number, Slot[]> = {};
    slots.forEach((s) => {
        const [, , dayStr] = s.date.split('-');
        const d = parseInt(dayStr, 10);
        if (!slotsByDay[d]) slotsByDay[d] = [];
        slotsByDay[d].push(s);
    });

    const navBtn = "bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 cursor-pointer text-sm hover:bg-slate-700 transition-colors";

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
            >
                <button onClick={onPrevMonth} className={navBtn}>←</button>
                <h2 className="m-0 text-lg font-semibold text-slate-200">
                    {MONTHS[month]} {year}
                </h2>
                <button onClick={onNextMonth} className={navBtn}>→</button>
            </div>

            {/* Day-of-week headers */}
            <div
                className="grid"
                style={{ gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(148,163,184,0.06)' }}
            >
                {DAYS_SHORT.map((d) => (
                    <div key={d} className="text-center py-3 text-sm font-semibold text-slate-500 uppercase tracking-widest">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                {/* Empty leading cells */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 min-h-[130px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum   = i + 1;
                    const daySlots = slotsByDay[dayNum] || [];
                    const hasSlots = daySlots.length > 0;
                    const cellDate = new Date(year, month, dayNum);
                    const isSelected =
                        selectedDay !== null &&
                        selectedDay.getFullYear() === year &&
                        selectedDay.getMonth()    === month &&
                        selectedDay.getDate()     === dayNum;

                    return (
                        <div
                            key={dayNum}
                            onClick={() => hasSlots && onDayClick(isSelected ? null : cellDate)}
                            className="p-2 min-h-[130px] rounded transition-all duration-200"
                            style={{
                                cursor:      hasSlots ? 'pointer' : 'default',
                                background:  isSelected ? 'rgba(56,189,248,0.08)' : 'transparent',
                                border:      isSelected ? '1px solid rgba(56,189,248,0.25)' : '1px solid transparent',
                            }}
                        >
                            <div
                                className="text-lg font-mono mb-1.5"
                                style={{
                                    fontWeight: hasSlots ? 600 : 400,
                                    color:      hasSlots ? '#e2e8f0' : '#334155',
                                }}
                            >
                                {dayNum}
                            </div>

                            {daySlots.length > 0 && (
                                <div className="flex flex-col gap-0.5">
                                    {daySlots.slice(0, 3).map((s) => {
                                        const fc = getFormatStyle(s.format);
                                        const label = s.product_name;
                                        return (
                                            <div
                                                key={s.id}
                                                className="text-sm px-2 py-1 rounded font-medium border leading-snug"
                                                style={{ background: fc.bg, color: fc.text, borderColor: fc.border }}
                                            >
                                                {label}
                                            </div>
                                        );
                                    })}
                                    {daySlots.length > 3 && (
                                        <div className="text-sm text-slate-500 font-medium pl-1">
                                            +{daySlots.length - 3} de plus
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
