import type { ViewMode } from '@/types';

const FORMATS = ['Soirée', 'Journalier', 'Journée et soirée', 'Voyage à Vie à bord', 'à définir'];

const VIEWS: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'month', label: 'Mois',     icon: '📅' },
    { key: 'week',  label: 'Semaine',  icon: '📆' },
    { key: 'list',  label: 'Liste',    icon: '📋' },
];

const selectStyle: React.CSSProperties = {
    background: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '9px 32px 9px 12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
};

type Props = {
    userNiveau: number;
    filterFormat: string;
    filterType: string;
    filterWomenOnly: boolean;
    viewMode: ViewMode;
    visibleCount: number;
    isAdmin: boolean;
    onFormatChange: (f: string) => void;
    onTypeChange: (t: string) => void;
    onWomenOnlyChange: (v: boolean) => void;
    onViewChange: (v: ViewMode) => void;
    onNiveauChange: (n: number) => void;
};

export default function FilterBar({
    userNiveau,
    filterFormat,
    filterType,
    filterWomenOnly,
    viewMode,
    visibleCount,
    isAdmin,
    onFormatChange,
    onTypeChange,
    onWomenOnlyChange,
    onViewChange,
    onNiveauChange,
}: Props) {
    return (
        <div
            className="flex flex-wrap gap-4 mb-6 px-5 py-4 rounded-2xl items-center"
            style={{
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(148,163,184,0.08)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Niveau — TODO: uncomment when niveau system is ready
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Votre niveau
                </div>
                {isAdmin ? (
                    <input
                        type="number"
                        min={1}
                        max={22}
                        value={userNiveau}
                        onChange={(e) => onNiveauChange(Number(e.target.value))}
                        style={{ ...selectStyle, appearance: 'auto', width: '90px' }}
                    />
                ) : (
                    <div
                        className="text-base font-semibold px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}
                    >
                        {userNiveau}
                    </div>
                )}
            </div>

            <div className="w-px h-9 bg-slate-800" />
            */}

            {/* Format */}
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Format
                </div>
                <select value={filterFormat} onChange={(e) => onFormatChange(e.target.value)} style={selectStyle}>
                    <option value="all">Tous les formats</option>
                    {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>

            <div className="w-px h-9 bg-slate-800" />

            {/* Type */}
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Type
                </div>
                <div className="flex gap-1">
                    {(['all', 'slot', 'formule'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => onTypeChange(t)}
                            className="px-4 py-2 rounded-lg text-base font-semibold border transition-all duration-200 cursor-pointer"
                            style={{
                                borderColor:  filterType === t ? '#38bdf8' : '#334155',
                                background:   filterType === t ? 'rgba(56,189,248,0.12)' : 'transparent',
                                color:        filterType === t ? '#38bdf8' : '#94a3b8',
                            }}
                        >
                            {t === 'all' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-px h-9 bg-slate-800" />

            {/* Women sailing */}
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Voile féminine
                </div>
                <button
                    onClick={() => onWomenOnlyChange(!filterWomenOnly)}
                    className="px-4 py-2 rounded-lg text-base font-semibold border transition-all duration-200 cursor-pointer"
                    style={{
                        borderColor: filterWomenOnly ? '#f472b6' : '#334155',
                        background:  filterWomenOnly ? 'rgba(244,114,182,0.12)' : 'transparent',
                        color:       filterWomenOnly ? '#f472b6' : '#94a3b8',
                    }}
                >
                    <span className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.8"/>
                            <line x1="12" y1="15" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            <line x1="8.5" y1="19" x2="15.5" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        Seulement
                    </span>
                </button>
            </div>

            <div className="flex-1" />

            {/* View toggle */}
            <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: '#1e293b' }}>
                {VIEWS.map((v) => (
                    <button
                        key={v.key}
                        onClick={() => onViewChange(v.key)}
                        className="px-4 py-2 rounded-md text-base font-medium border-0 transition-all duration-200 whitespace-nowrap cursor-pointer"
                        style={{
                            background: viewMode === v.key ? '#334155' : 'transparent',
                            color:      viewMode === v.key ? '#e2e8f0' : '#64748b',
                        }}
                    >
                        {v.icon} {v.label}
                    </button>
                ))}
            </div>

            {/* Count badge */}
            <div
                className="px-3.5 py-2 rounded-lg text-base font-semibold font-mono"
                style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8' }}
            >
                {visibleCount} dispo.
            </div>
        </div>
    );
}
