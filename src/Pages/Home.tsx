import { useState } from 'react'
import { Link } from 'react-router-dom'

function WhyBuyModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="modal-title" className="text-2xl font-bold text-[#10113A] mb-6 text-center">
                    Pourquoi acheter une formule ?
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6 w-full text-left">
                    <li>Tarifs avantageux</li>
                    <li>Accès prioritaire</li>
                    <li>Flexibilité de réservation</li>
                </ul>
                <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-[#D4AF37] text-[#10113A] font-bold shadow hover:bg-[#c9a233] transition"
                >
                    Fermer
                </button>
            </div>
        </div>
    )
}

const primaryCards = [
    {
        title: 'Formules & Packs',
        description: "Découvrez nos formules adaptées à tous les niveaux et nos packs de sorties pour profiter pleinement de la saison.",
        buttonLabel: 'Réserver une formule',
        to: '/formulas',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15.75c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5" />
            </svg>
        ),
    },
    {
        title: 'Sortie personnalisée',
        description: "Réservez une sortie sur-mesure selon vos envies, votre niveau et vos disponibilités.",
        buttonLabel: 'Sortie personnalisée',
        to: '/booking/date',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 19.5A2.25 2.25 0 006.75 21h10.5a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 7.5v12z" />
            </svg>
        ),
    },
    {
        title: 'Propriétaire de bateau',
        description: "Vous avez votre propre bateau ? Profitez de nos services et de l'accès à la communauté SWEN.",
        buttonLabel: 'Réserver avec mon bateau',
        to: '/booking/own-boat',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0c-3.866 0-7 1.343-7 3v1.5a.75.75 0 00.75.75h12.5a.75.75 0 00.75-.75V18c0-1.657-3.134-3-7-3z" />
            </svg>
        ),
    },
]

const otherServices = [
    {
        title: 'Convoyage',
        description: "Besoin de déplacer votre bateau ? Notre équipe s'occupe du convoyage en toute sécurité, partout au Québec et au-delà.",
        buttonLabel: 'Demander un convoyage',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l4-4m-4 4l4 4" />
            </svg>
        ),
    },
    {
        title: 'Voyages personnalisés',
        description: "Envie d'une aventure sur-mesure ? Nous organisons des expériences personnalisées selon vos envies et votre niveau.",
        buttonLabel: 'Créer mon voyage',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0 0l-4-4m4 4l4-4" />
            </svg>
        ),
    },
    {
        title: 'Teambuilding',
        description: "Renforcez la cohésion de votre équipe avec nos activités de teambuilding sur l'eau, adaptées aux entreprises et groupes.",
        buttonLabel: 'Organiser un teambuilding',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" />
            </svg>
        ),
    },
]

export default function Home() {
    const [showModal, setShowModal] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {showModal && <WhyBuyModal onClose={() => setShowModal(false)} />}

            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10113A] via-[#1a1d5a] to-[#10113A] opacity-5 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-32">

                    {/* Hero */}
                    <div className="mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-8 items-center">
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <img src="/logo.png" alt="Logo SWEN Voile" className="h-20 w-auto mb-4" />
                                <h1 className="text-3xl md:text-4xl font-bold text-[#10113A] mb-1">
                                    Plateforme de Réservation
                                </h1>
                                <h2 className="text-xl md:text-2xl font-semibold text-[#10113A] mb-2">
                                    Un cadre et une équipe exceptionnels pour vivre la voile à Montréal.
                                </h2>
                                <div className="w-24 h-1 bg-[#D4AF37] mb-4 md:mx-0 mx-auto" />
                                <div className="text-lg text-gray-700 leading-relaxed md:leading-loose">
                                    <ul className="list-disc pl-6 text-gray-700 mb-2 space-y-1">
                                        <li>Partenariat exceptionnel entre SWEN, Paré à virer et le Club nautique de Beaconsfield!</li>
                                        <li>Encadrement assuré par des jeunes (de tout âge) passionnés et professionnels.</li>
                                        <li>Ambiance conviviale et sécuritaire</li>
                                        <li>Progression du niveau débutant au Yachtmaster</li>
                                        <li>Accès à des formules adaptées et des packs de sortie</li>
                                    </ul>
                                    <span className="block mt-2 text-sm text-gray-500">
                                        Rejoignez-nous et construisez une communauté qui vit la voile à Montréal dans les meilleures conditions !
                                    </span>
                                </div>
                                <div className="flex justify-center md:justify-start mt-4">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f6fa] border border-[#D4AF37] text-[#10113A] font-semibold shadow hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                    >
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#D4AF37] bg-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 16v-4" />
                                                <path d="M12 8h.01" />
                                            </svg>
                                        </span>
                                        Pourquoi acheter une formule ou un pack de sortie ?
                                    </button>
                                </div>
                            </div>

                            {/* Partner logos */}
                            <div className="flex flex-col items-center gap-0">
                                <img
                                    src="https://pareavirer.com/wp-content/uploads/2023/06/Pare-a-virer-Facebook.jpg"
                                    alt="Logo Paré à virer"
                                    className="h-56 w-72 object-contain hover:grayscale-0 transition rounded mb-2"
                                    loading="lazy"
                                />
                                <img
                                    src="https://tse1.mm.bing.net/th/id/OIP.-80dObRGUlkLLoC9A1Z0GAHaEr?rs=1&pid=ImgDetMain&o=7&rm=3"
                                    alt="Logo Club de voile de Beaconsfield"
                                    className="h-56 w-72 object-contain hover:grayscale-0 transition rounded"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Primary cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {primaryCards.map((card) => (
                            <div key={card.title} className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-105 hover:shadow-2xl flex flex-col min-h-[420px] cursor-pointer">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#10113A] to-[#1a1d5a] rounded-full flex items-center justify-center mb-6 mx-auto">
                                    {card.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-[#10113A] mb-4 text-center">{card.title}</h2>
                                <p className="text-gray-600 text-center leading-relaxed mb-6 flex-grow">{card.description}</p>
                                <Link
                                    to={card.to}
                                    className="w-full inline-block px-6 py-3 rounded-full bg-[#D4AF37] text-[#10113A] font-semibold shadow hover:bg-[#c9a233] transition text-center"
                                >
                                    {card.buttonLabel}
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">Paiement sécurisé • Annulation flexible • Support client réactif</p>
                    </div>
                </div>
            </div>

            {/* Other services */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#10113A] mb-8 text-center">Nos autres services</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {otherServices.map((service) => (
                        <div key={service.title} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition cursor-pointer">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#10113A] to-[#1a1d5a] rounded-full flex items-center justify-center mb-6">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[#10113A] mb-2">{service.title}</h3>
                            <p className="text-gray-600 text-center mb-4">{service.description}</p>
                            <button className="mt-auto px-6 py-2 rounded-full bg-[#D4AF37] text-[#10113A] font-semibold shadow hover:bg-[#c9a233] transition">
                                {service.buttonLabel}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
