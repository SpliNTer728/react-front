import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/Context/AppContext';

// ── Types ────────────────────────────────────────────────────────────────────

type BookingDetail = {
    id: string;
    productName: string;
    format: string;
    type: 'slot' | 'formule';
    date: string;
    startTime: string;
    endTime: string;
    lieu: string;
    totalPaid: number;
    currency: string;
    stripeReceiptUrl: string;
    customerEmail: string;
};

// ── Mock (replace with real fetch once backend has GET /api/booking/session/:id) ──

const MOCK_BOOKING: BookingDetail = {
    id: 'book_7k2m9x',
    productName: '5 à 8 - Découvrir la voile',
    format: 'Soirée',
    type: 'slot',
    date: '2026-06-18',
    startTime: '17:00',
    endTime: '20:00',
    lieu: 'Yacht Club de Beaconsfield',
    totalPaid: 85.00,
    currency: 'CAD',
    stripeReceiptUrl: '#',
    customerEmail: 'jean.tremblay@email.com',
};

// ── Date helpers ─────────────────────────────────────────────────────────────

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FULL = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${DAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Animation components ─────────────────────────────────────────────────────

function AnimatedCheck() {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); }, []);
    return (
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ overflow: 'visible' }}>
            <circle cx="36" cy="36" r="34" fill="none" stroke="url(#checkGrad)" strokeWidth="2.5"
                style={{
                    strokeDasharray: 214, strokeDashoffset: visible ? 0 : 214,
                    transition: 'stroke-dashoffset 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
                }} />
            <path d="M22 36 L32 46 L50 26" fill="none" stroke="url(#checkGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{
                    strokeDasharray: 50, strokeDashoffset: visible ? 0 : 50,
                    transition: 'stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
                    transitionDelay: '500ms',
                }} />
            <defs>
                <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

type FadeInProps = { children: React.ReactNode; delay?: number };

function FadeIn({ children, delay = 0 }: FadeInProps) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
    return (
        <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${delay}ms`,
        }}>{children}</div>
    );
}

function useConfetti(count = 45) {
    const [particles, setParticles] = useState<React.CSSProperties[]>([]);
    useEffect(() => {
        const timer = setTimeout(() => {
            const colors = ['#0ea5e9','#6366f1','#a78bfa','#38bdf8','#34d399','#fb923c','#f87171','#67e8f9'];
            setParticles(Array.from({ length: count }, () => {
                const size = 4 + Math.random() * 6;
                const isCircle = Math.random() > 0.5;
                return {
                    position: 'absolute',
                    left: `${10 + Math.random() * 80}%`,
                    top: '-10px',
                    width: `${size}px`,
                    height: isCircle ? `${size}px` : `${size * 2.5}px`,
                    borderRadius: isCircle ? '50%' : '2px',
                    background: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 0,
                    animation: `confettiFall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.6}s forwards`,
                    // CSS custom properties for the keyframe
                    ['--spread' as string]: `${(Math.random() - 0.5) * 120}px`,
                    ['--rotation' as string]: `${Math.random() * 720 - 360}deg`,
                    pointerEvents: 'none' as const,
                };
            }));
        }, 800);
        return () => clearTimeout(timer);
    }, [count]);
    return particles;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BookingSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAppContext();

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const particles = useConfetti(45);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // TODO: replace with real fetch once backend exposes the endpoint:
                // const res = await fetch(`/api/booking/session/${sessionId}`, {
                //     headers: { Authorization: `Bearer ${token}` },
                // });
                // if (!res.ok) throw new Error('Impossible de charger les détails de la réservation.');
                // const data: BookingDetail = await res.json();
                // setBooking(data);

                await new Promise((r) => setTimeout(r, 400)); // simulate network
                setBooking(MOCK_BOOKING);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [sessionId, token]);

    const handleCopyId = () => {
        if (booking) navigator.clipboard?.writeText(booking.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(165deg, #020617 0%, #0c1222 40%, #091520 100%)',
            color: '#e2e8f0',
            fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0 20px',
            position: 'relative', overflow: 'hidden',
        }}>
            <style>{`
                @keyframes confettiFall {
                    0%   { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg); }
                    100% { opacity: 0; transform: translateY(85vh) translateX(var(--spread)) rotate(var(--rotation)); }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%       { opacity: 0.7; transform: scale(1.05); }
                }
            `}</style>

            {/* Ambient glows */}
            <div style={{
                position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
                pointerEvents: 'none', animation: 'pulseGlow 4s ease-in-out infinite',
            }} />
            <div style={{
                position: 'fixed', bottom: '-10%', right: '10%', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Confetti */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
                {particles.map((style, i) => <div key={i} style={style} />)}
            </div>

            <div style={{ maxWidth: '520px', width: '100%', marginTop: '80px', position: 'relative', zIndex: 1 }}>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#475569', paddingTop: '80px' }}>
                        <span style={{ fontSize: '14px' }}>Chargement de votre réservation…</span>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '16px 20px', borderRadius: '12px', fontSize: '14px',
                        color: '#f87171', background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(248,113,113,0.2)',
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                {!loading && booking && (<>

                    {/* Checkmark */}
                    <FadeIn delay={100}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                            <AnimatedCheck />
                        </div>
                    </FadeIn>

                    {/* Title */}
                    <FadeIn delay={600}>
                        <h1 style={{
                            textAlign: 'center', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0',
                            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px',
                        }}>Réservation confirmée</h1>
                    </FadeIn>

                    <FadeIn delay={750}>
                        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '0 0 36px 0', lineHeight: '1.6' }}>
                            Votre place a été réservée avec succès. Un courriel de confirmation a été envoyé à{' '}
                            <span style={{ color: '#94a3b8', fontWeight: '500' }}>{booking.customerEmail}</span>.
                        </p>
                    </FadeIn>

                    {/* Booking card */}
                    <FadeIn delay={900}>
                        <div style={{
                            background: 'rgba(15,23,42,0.7)', borderRadius: '20px',
                            border: '1px solid rgba(148,163,184,0.08)',
                            overflow: 'hidden', backdropFilter: 'blur(16px)',
                        }}>
                            {/* Card header */}
                            <div style={{
                                padding: '20px 24px 16px',
                                background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(99,102,241,0.1) 100%)',
                                borderBottom: '1px solid rgba(148,163,184,0.06)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                                        Formule réservée
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.3' }}>{booking.productName}</div>
                                </div>
                                <div style={{
                                    padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
                                    background: booking.type === 'slot' ? '#164e63' : '#4a1d6e',
                                    color:      booking.type === 'slot' ? '#67e8f9' : '#c084fc',
                                }}>{booking.type}</div>
                            </div>

                            {/* Details grid */}
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
                                    {[
                                        { label: 'Date',    value: formatDate(booking.date) },
                                        { label: 'Horaire', value: `${booking.startTime} – ${booking.endTime}` },
                                        { label: 'Lieu',    value: booking.lieu },
                                        { label: 'Format',  value: booking.format },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', lineHeight: '1.4' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'rgba(148,163,184,0.06)', margin: '0 24px' }} />

                            {/* Payment summary */}
                            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                                        Montant payé
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Space Mono', monospace", letterSpacing: '-1px' }}>
                                        {booking.totalPaid.toFixed(2)}{' '}
                                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{booking.currency}</span>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px', borderRadius: '8px',
                                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#34d399' }}>Payé</span>
                                </div>
                            </div>

                            {/* Booking ref */}
                            <div style={{
                                padding: '14px 24px', background: 'rgba(0,0,0,0.15)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: '#475569' }}>
                                    Réf:{' '}
                                    <span style={{ fontFamily: "'Space Mono', monospace", color: '#64748b', fontWeight: '600' }}>{booking.id}</span>
                                </div>
                                <button
                                    onClick={handleCopyId}
                                    style={{
                                        background: 'none', border: '1px solid #334155', borderRadius: '6px',
                                        padding: '4px 10px', fontSize: '11px', color: '#64748b', cursor: 'pointer',
                                        fontWeight: '500',
                                    }}
                                >
                                    {copied ? '✓ Copié' : 'Copier'}
                                </button>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Next steps */}
                    <FadeIn delay={1200}>
                        <div style={{
                            marginTop: '24px', padding: '20px 24px', borderRadius: '16px',
                            background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.06)',
                        }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px', color: '#94a3b8' }}>Prochaines étapes</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { num: '1', text: 'Vérifiez votre courriel pour la confirmation et les détails d\'accès.' },
                                    { num: '2', text: 'Présentez-vous 15 minutes avant l\'heure de début au lieu indiqué.' },
                                    { num: '3', text: 'Apportez vêtements adaptés à la météo et chaussures fermées.' },
                                ].map((step) => (
                                    <div key={step.num} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                                            background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15))',
                                            border: '1px solid rgba(56,189,248,0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: '700', color: '#38bdf8',
                                            fontFamily: "'Space Mono', monospace",
                                        }}>{step.num}</div>
                                        <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', paddingTop: '1px' }}>{step.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    {/* CTAs */}
                    <FadeIn delay={1400}>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', marginBottom: '60px' }}>
                            <button
                                onClick={() => navigate('/reserver')}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                                    border: '1px solid #334155', background: 'rgba(15,23,42,0.6)', color: '#e2e8f0',
                                    cursor: 'pointer', backdropFilter: 'blur(8px)',
                                }}
                            >
                                ← Retour au calendrier
                            </button>
                            <a
                                href={booking.stripeReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                                    border: 'none', textAlign: 'center', textDecoration: 'none',
                                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                                    color: '#fff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                Voir le reçu Stripe ↗
                            </a>
                        </div>
                    </FadeIn>

                </>)}
            </div>
        </div>
    );
}
