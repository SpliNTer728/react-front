import type { Slot } from '@/types';
import { MONTHS, DAYS_SHORT, getFormatStyle, getTypeStyle, parseSlotDate } from './utils';

type Props = {
    year: number;
    month: number;
    slots: Slot[];
    onBook: (slot: Slot) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
};

export default function ListView({ year, month, slots, onBook, onPrevMonth, onNextMonth }: Props) {
    const navBtn = "bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 cursor-pointer text-sm hover:bg-slate-700 transition-colors";

    return (
        <div className="flex flex-col gap-2">
            {/* Month navigation */}
            <div
                className="flex items-center justify-between px-4 py-3 rounded-xl mb-1"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
            >
                <button onClick={onPrevMonth} className={navBtn}>←</button>
                <span className="text-[15px] font-semibold text-slate-200">{MONTHS[month]} {year}</span>
                <button onClick={onNextMonth} className={navBtn}>→</button>
            </div>

            {slots.length === 0 && (
                <div
                    className="py-12 px-6 text-center text-slate-600 text-sm rounded-2xl"
                    style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
                >
                    Aucune disponibilité pour votre niveau ce mois-ci.
                </div>
            )}

            {slots.map((s) => {
                const fc       = getFormatStyle(s.format);
                const tc       = getTypeStyle(s.type);
                const slotDate = parseSlotDate(s.date, s.start_time);
                const spotsColor = s.spots_remaining <= 2 ? '#f87171' : '#34d399';

                return (
                    <div
                        key={s.id}
                        className="flex items-center gap-5 px-5 py-4 rounded-xl cursor-pointer border transition-all duration-200"
                        style={{ background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(148,163,184,0.08)' }}
                        onClick={() => onBook(s)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(56,189,248,0.3)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(148,163,184,0.08)'; }}
                    >
                        {/* Date block */}
                        <div className="font-mono text-base text-slate-400 min-w-[90px] text-center leading-relaxed">
                            <div className="font-bold text-slate-200 text-2xl">{slotDate.getDate()}</div>
                            <div>{MONTHS[slotDate.getMonth()].slice(0, 3)}</div>
                            <div>{DAYS_SHORT[slotDate.getDay()]}</div>
                            <div>{s.start_time}</div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="text-lg font-semibold text-slate-200 mb-2 truncate">
                                {s.product_name}
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                <span className="text-sm px-2.5 py-0.5 rounded font-medium border"
                                    style={{ background: fc.bg, color: fc.text, borderColor: fc.border }}>
                                    {s.format}
                                </span>
                                <span className="text-sm px-2.5 py-0.5 rounded font-medium"
                                    style={{ background: tc.bg, color: tc.text }}>
                                    {s.type}
                                </span>
                                {s.lieu && (
                                    <span className="text-sm px-2.5 py-0.5 rounded font-medium bg-slate-900 text-slate-400">
                                        📍 {s.lieu}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Spots */}
                        <div className="text-base font-semibold font-mono shrink-0" style={{ color: spotsColor }}>
                            {s.spots_remaining}/{s.max_spots}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
