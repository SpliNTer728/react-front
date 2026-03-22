import type { Slot } from '@/types';
import { getFormatStyle, getTypeStyle, padHour } from './utils';

type Props = {
    slot: Slot;
    onBook: (slot: Slot) => void;
};

export default function SlotCard({ slot, onBook }: Props) {
    const fc = getFormatStyle(slot.format);
    const tc = getTypeStyle(slot.type);
    const [startH] = slot.start_time.split(':').map(Number);
    const spotsColor = slot.spots_remaining <= 2 ? '#f87171' : '#34d399';

    return (
        <div
            className="rounded-xl p-4 border border-slate-800 cursor-pointer transition-all duration-200 hover:-translate-y-px"
            style={{ background: '#0f172a' }}
            onClick={() => onBook(slot)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(56,189,248,0.3)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(30,41,59,1)'; }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-semibold flex-1 leading-snug text-slate-200">
                    {slot.product_name}
                </div>
                <div
                    className="text-base font-semibold font-mono whitespace-nowrap ml-2"
                    style={{ color: spotsColor }}
                >
                    {slot.spots_remaining}/{slot.max_spots}
                </div>
            </div>

            <div className="flex gap-1 flex-wrap mb-2">
                <span className="text-sm px-2.5 py-0.5 rounded font-medium border"
                    style={{ background: fc.bg, color: fc.text, borderColor: fc.border }}>
                    {slot.format}
                </span>
                <span className="text-sm px-2.5 py-0.5 rounded font-medium"
                    style={{ background: tc.bg, color: tc.text }}>
                    {slot.type}
                </span>
                <span className="text-sm px-2.5 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-400">
                    {padHour(startH)}:00
                </span>
            </div>

            {slot.lieu && (
                <div className="text-sm text-slate-500 mb-2.5">
                    📍 {slot.lieu}
                </div>
            )}

            <button
                className="w-full py-3 rounded-lg text-base font-semibold text-white transition-opacity duration-200 hover:opacity-85 cursor-pointer border-0"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                onClick={(e) => { e.stopPropagation(); onBook(slot); }}
            >
                Réserver →
            </button>
        </div>
    );
}
