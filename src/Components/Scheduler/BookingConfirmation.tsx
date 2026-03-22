import type { Slot } from '@/types';
import { MONTHS, parseSlotDate, padHour } from './utils';

type Props = {
    slot: Slot;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function BookingConfirmation({ slot, loading, onConfirm, onCancel }: Props) {
    const slotDate = parseSlotDate(slot.date, slot.start_time);
    const dateLabel = `${slotDate.getDate()} ${MONTHS[slotDate.getMonth()]} ${slotDate.getFullYear()}`;
    const timeLabel = `${padHour(slotDate.getHours())}:00`;

    return (
        <div
            className="rounded-2xl p-6"
            style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(56,189,248,0.2)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <h3 className="m-0 mb-4 text-xl font-semibold text-slate-200">
                Confirmer la réservation
            </h3>

            {/* Slot details */}
            <div
                className="rounded-xl p-5 mb-4 border border-slate-800"
                style={{ background: '#0f172a' }}
            >
                <div className="text-lg font-semibold text-slate-200 mb-3">
                    {slot.product_name}
                </div>
                <div className="text-sm text-slate-400 leading-relaxed">
                    📅 {dateLabel}<br />
                    🕐 {timeLabel}<br />
                    📍 {slot.lieu || 'À définir'}<br />
                    👥 {slot.spots_remaining} place{slot.spots_remaining > 1 ? 's' : ''} restante{slot.spots_remaining > 1 ? 's' : ''}
                </div>
            </div>

            {/* Stripe note */}
            <div
                className="px-3 py-3 rounded-lg mb-4 text-sm leading-relaxed"
                style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc',
                }}
            >
                💳 Vous serez redirigé vers Stripe Checkout pour finaliser le paiement.
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-lg text-base font-semibold border border-slate-700 bg-transparent text-slate-400 cursor-pointer hover:text-slate-200 hover:border-slate-500 transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg text-base font-semibold border-0 text-white cursor-pointer transition-opacity disabled:opacity-70 disabled:cursor-wait"
                    style={{ background: loading ? '#334155' : 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                    {loading ? 'Chargement…' : 'Réserver →'}
                </button>
            </div>
        </div>
    );
}
