import type { Slot } from '@/types';
import { MONTHS, DAYS_FULL } from './utils';
import SlotCard from './SlotCard';

type Props = {
    selectedDay: Date;
    slots: Slot[];
    onBook: (slot: Slot) => void;
};

export default function DayDetailPanel({ selectedDay, slots, onBook }: Props) {
    const dayLabel = `${DAYS_FULL[selectedDay.getDay()]} ${selectedDay.getDate()} ${MONTHS[selectedDay.getMonth()]}`;

    return (
        <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
        >
            <h3 className="m-0 mb-1 text-xl font-semibold text-slate-200">{dayLabel}</h3>
            <p className="m-0 mb-4 text-sm text-slate-500">
                {slots.length} formule{slots.length > 1 ? 's' : ''} disponible{slots.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {slots.map((s) => (
                    <SlotCard key={s.id} slot={s} onBook={onBook} />
                ))}
            </div>
        </div>
    );
}
