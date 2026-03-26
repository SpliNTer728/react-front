import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NIVEAU_FILTERS = ['Tous', 'Initiation', 'Élémentaire', 'Intermédiaire', 'Avancé'];

const BUNDLES = [
    {
        id: 'initiation',
        name: 'Initiation à la voile',
        badge: null,
        certification: 'Voile Canada',
        description: 'Initiation à la voile expérience',
        detail: '2 journées de Navigation - manoeuvres élémentaire',
        duree: '14 heures',
        creneaux: 'Journée, soirée',
        prix: 400,
        niveau: 'Initiation',
    },
    {
        id: 'elementaire',
        name: 'Croisière Élémentaire',
        badge: 'Favoris',
        certification: 'Voile Canada',
        description: 'Perfectionnement voile',
        detail: '2 journées de Navigation - manoeuvres élémentaire\n+\n2 journées de Navigation - manoeuvres complexes',
        duree: '32 heures',
        creneaux: 'Journée, soirée',
        prix: 930,
        niveau: 'Élémentaire',
    },
    {
        id: 'avance',
        name: 'Navigation avancée',
        badge: null,
        certification: 'Voile Canada',
        description: 'Maîtrise des techniques avancées de navigation',
        detail: null,
        duree: '40 heures',
        creneaux: 'Journée, soirée',
        prix: 700,
        niveau: 'Avancé',
    },
];

export default function BundlesPage() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('Tous');

    const visible = BUNDLES.filter(
        (b) => activeFilter === 'Tous' || b.niveau === activeFilter,
    );

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
            <div className="fixed pointer-events-none" style={{ bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)' }} />

            <div className="px-8 py-8 relative z-10 max-w-[1280px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="text-3xl font-bold mb-1.5 tracking-tight"
                        style={{ background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        Formules — Bateau personnel
                    </h1>
                    <p className="text-slate-500 text-lg m-0">
                        Sélectionnez la formule qui correspond à vos besoins
                    </p>
                </div>

                {/* Niveau filter */}
                <div
                    className="rounded-xl p-5 mb-8"
                    style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
                >
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                        Filtrer par niveau
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {NIVEAU_FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer"
                                style={
                                    activeFilter === f
                                        ? { background: 'rgba(56,189,248,0.15)', borderColor: '#38bdf8', color: '#38bdf8' }
                                        : { background: 'transparent', borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8' }
                                }
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bundle cards */}
                <div className="flex flex-wrap gap-6 mb-6">
                    {visible.map((b) => (
                        <div
                            key={b.id}
                            className="flex-1 min-w-[260px] max-w-xs rounded-2xl p-6 flex flex-col justify-between"
                            style={{
                                background: 'rgba(15,23,42,0.7)',
                                border: b.badge ? '2px solid #e6c200' : '1px solid rgba(148,163,184,0.1)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div>
                                {/* Badge */}
                                <div className="h-6 mb-2 flex justify-end">
                                    {b.badge && (
                                        <span
                                            className="text-xs font-bold px-3 py-1 rounded-full"
                                            style={{ background: '#e6c200', color: '#23244c' }}
                                        >
                                            {b.badge}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold text-slate-100 mb-1">{b.name}</h2>
                                <div className="text-slate-500 text-sm mb-1">{b.certification}</div>
                                <div className="text-slate-400 text-base mb-1">{b.description}</div>
                                {b.detail && (
                                    <div className="text-slate-500 text-sm mb-4 whitespace-pre-line">{b.detail}</div>
                                )}
                                {!b.detail && <div className="mb-4" />}

                                <div className="flex items-center gap-2 mb-1 text-slate-400 text-sm">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                                    </svg>
                                    {b.duree}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Créneaux en : {b.creneaux}
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-2xl font-bold text-slate-100">{b.prix}&nbsp;$CAD</span>
                                    <span className="text-sm font-semibold" style={{ color: '#e6c200' }}>/bateau · 4 pers. max.</span>
                                </div>
                                <button
                                    onClick={() => navigate('/reserver')}
                                    className="w-full py-2.5 rounded-lg text-sm font-semibold border-0 text-white cursor-pointer transition-opacity hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                                >
                                    Choisir cette formule →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sur mesure — full-width card */}
                <div
                    className="rounded-2xl p-6 flex flex-col md:flex-row md:items-start gap-6"
                    style={{ background: 'linear-gradient(135deg, rgba(35,36,76,0.9), rgba(75,89,152,0.7))', border: '1px solid rgba(148,163,184,0.1)' }}
                >
                    <div className="md:w-[20%]">
                        <div className="flex gap-1 text-yellow-400 mb-2">{'★★★★★'}</div>
                    </div>
                    <div className="md:w-[25%]">
                        <h2 className="text-xl font-bold text-slate-100 mb-1">Sur mesure</h2>
                        <div className="text-slate-300 mb-1">Créer une formule personnalisée</div>
                        <div className="text-slate-400 italic text-sm">Flexibilité totale, prix à définir</div>
                    </div>
                    <div className="md:w-[55%]">
                        <div
                            className="rounded-lg p-4 text-sm space-y-1"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                            <div>💲 <strong>À la journée</strong> : à partir de 400 $CAD</div>
                            <div>💲 <strong>3 heures</strong> : à partir de 190 $CAD</div>
                            <div>🚗 <strong>Transport voiture</strong> : 0,68 $CAD/km</div>
                            <div>✈️ <strong>Transport avion</strong> : Au coût réel</div>
                            <div>🍽️ <strong>Nourriture</strong> : 45 $CAD/jour</div>
                            <div>🛏️ <strong>Logement</strong> : Au coût réel</div>
                        </div>
                        <button
                            onClick={() => navigate('/reserver')}
                            className="mt-4 px-6 py-2.5 rounded-lg text-sm font-semibold border-0 text-white cursor-pointer transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                        >
                            Nous contacter →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
