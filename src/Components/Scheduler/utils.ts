export const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const DAYS_FULL  = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Hours that can appear in the week view grid
export const GRID_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// ── Color helpers ────────────────────────────────────────────────────────────

type ColorSet = { bg: string; text: string; border: string };

export function getFormatStyle(format: string): ColorSet {
    switch (format) {
        case 'Soirée':
            return { bg: '#1a1a2e', text: '#a78bfa', border: '#4c1d95' };
        case 'Journalier':
            return { bg: '#0a1628', text: '#38bdf8', border: '#0c4a6e' };
        case 'Journée et soirée':
            return { bg: '#0f1f1a', text: '#34d399', border: '#065f46' };
        case 'Voyage à Vie à bord':
            return { bg: '#1f0f0f', text: '#fb923c', border: '#7c2d12' };
        default:
            return { bg: '#1a1a1a', text: '#a1a1aa', border: '#3f3f46' };
    }
}

export function getTypeStyle(type: 'slot' | 'formule'): { bg: string; text: string } {
    return type === 'slot'
        ? { bg: '#164e63', text: '#67e8f9' }
        : { bg: '#4a1d6e', text: '#c084fc' };
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth()    === b.getMonth()    &&
        a.getDate()     === b.getDate()
    );
}

/** Returns the 7 Date objects for the week containing `base` (Sun→Sat). */
export function getWeekDates(base: Date): Date[] {
    const sun = new Date(base);
    sun.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sun);
        d.setDate(sun.getDate() + i);
        return d;
    });
}

/** Parse an ISO date string "YYYY-MM-DD" + "HH:mm" time into a Date. */
export function parseSlotDate(dateStr: string, timeStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min]  = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
}

export function formatWeekLabel(weekDates: Date[]): string {
    const s = weekDates[0];
    const e = weekDates[6];
    if (s.getMonth() === e.getMonth()) {
        return `${s.getDate()} – ${e.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
    }
    return `${s.getDate()} ${MONTHS[s.getMonth()].slice(0, 3)} – ${e.getDate()} ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getFullYear()}`;
}

export function padHour(h: number): string {
    return String(h).padStart(2, '0');
}
