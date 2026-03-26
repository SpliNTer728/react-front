import type { Slot, SlotsApiResponse } from '@/types';

// ── Formule catalog (calendar-visible only — "SI inscription" products excluded) ──
// niveau integers from Besoins-Louis mapping table

const FORMULE_CATALOG = [
    // Slot-type (single calendar entry)
    { stripe_product_id: 'prod_001', product_name: '5 à 8 - Découvrir la voile',                    type: 'slot'    as const, format: 'Soirée',              niveau: 1,  max_spots: 4,  duree_heures: 4,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 20 },
    { stripe_product_id: 'prod_002', product_name: 'Balade à Voile',                                 type: 'slot'    as const, format: 'Journalier',          niveau: 5,  max_spots: 4,  duree_heures: 7,    lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_003', product_name: 'Initiation à la Navigation de Nuit',             type: 'slot'    as const, format: 'Soirée',              niveau: 9,  max_spots: 4,  duree_heures: 5,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 22 },
    { stripe_product_id: 'prod_004', product_name: 'Journée de Navigation - manoeuvres complexes',   type: 'slot'    as const, format: 'Journalier',          niveau: 6,  max_spots: 4,  duree_heures: 7,    lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_005', product_name: 'Journée de Navigation - manoeuvres élémentaire', type: 'slot'    as const, format: 'Journalier',          niveau: 5,  max_spots: 4,  duree_heures: 7,    lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_006', product_name: 'Manoeuvre de Port & Pilotage',                   type: 'slot'    as const, format: 'Soirée',              niveau: 5,  max_spots: 4,  duree_heures: 3,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 20 },
    { stripe_product_id: 'prod_007', product_name: 'Pratique de Navigation - Soirée',                type: 'slot'    as const, format: 'Soirée',              niveau: 5,  max_spots: 4,  duree_heures: 3,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 20 },
    // Formule-type (multi-session programs)
    { stripe_product_id: 'prod_008', product_name: "Cap sur l'Instructeur IVQ et élémentaire",       type: 'formule' as const, format: 'Journée et soirée',  niveau: 16, max_spots: 4,  duree_heures: null, lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_009', product_name: 'Cap sur le Yachtmaster',                         type: 'formule' as const, format: 'Voyage à Vie à bord', niveau: 21, max_spots: 4,  duree_heures: null, lieu: 'Destination sur mesure',     start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_010', product_name: "Cap sur l'Avancé",                               type: 'formule' as const, format: 'Journée et soirée',  niveau: 18, max_spots: 8,  duree_heures: null, lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_011', product_name: "Cap sur l'Intermédiaire",                        type: 'formule' as const, format: 'Journée et soirée',  niveau: 14, max_spots: 8,  duree_heures: null, lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_012', product_name: 'Croisière Avancée',                              type: 'formule' as const, format: 'Voyage à Vie à bord', niveau: 19, max_spots: 4,  duree_heures: null, lieu: 'Destination sur mesure',     start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_013', product_name: 'Croisière Intermédiaire',                        type: 'formule' as const, format: 'Voyage à Vie à bord', niveau: 15, max_spots: 6,  duree_heures: null, lieu: 'Destination sur mesure',     start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_014', product_name: 'Croisière élémentaire',                          type: 'formule' as const, format: 'Journalier',          niveau: 4,  max_spots: 4,  duree_heures: 32,   lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_015', product_name: 'Initiation à la voile',                          type: 'formule' as const, format: 'Journalier',          niveau: 3,  max_spots: 4,  duree_heures: 14,   lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_016', product_name: 'Voyage Accompagné',                              type: 'formule' as const, format: 'Voyage à Vie à bord', niveau: 4,  max_spots: 10, duree_heures: null, lieu: 'Destination sur mesure',     start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_017', product_name: 'Voyage en Flotille',                             type: 'formule' as const, format: 'Voyage à Vie à bord', niveau: 20, max_spots: 8,  duree_heures: null, lieu: 'Destination sur mesure',     start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_018', product_name: 'Voyager autrement à la voile',                   type: 'formule' as const, format: 'Voyage à Vie à bord', niveau: 2,  max_spots: 10, duree_heures: null, lieu: 'Destination sur mesure',     start_hour: 9,  end_hour: 18 },
];

// Seeded pseudo-random to get stable mock data across renders
function seededRand(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

export function getMockSlots(month: number, year: number, userNiveau: number): SlotsApiResponse {
    const rand = seededRand(month * 100 + year);
    const slots: Slot[] = [];
    let id = 1;

    FORMULE_CATALOG
        // .filter((f) => f.niveau <= userNiveau) // TODO: enable when niveau system is ready
        .forEach((f) => {
            const count = f.type === 'slot' ? 8 : 3;
            for (let i = 0; i < count; i++) {
                const day = 1 + Math.floor(rand() * 28);
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const startTime = `${String(f.start_hour).padStart(2, '0')}:00`;
                const endTime   = `${String(f.end_hour).padStart(2, '0')}:00`;
                const spotsLeft = Math.max(1, Math.floor(rand() * f.max_spots) + 1);

                slots.push({
                    id: id++,
                    stripe_product_id: f.stripe_product_id,
                    product_name: f.product_name,
                    type: f.type,
                    format: f.format,
                    niveau: f.niveau,
                    date: dateStr,
                    start_time: startTime,
                    end_time: endTime,
                    spots_remaining: spotsLeft,
                    max_spots: f.max_spots,
                    duree_heures: f.duree_heures,
                    lieu: f.lieu,
                    women_sailing: rand() < 0.15,
                    nb_max_personnes: f.max_spots,
                });
            }
        });

    slots.sort((a, b) => (a.date + 'T' + a.start_time).localeCompare(b.date + 'T' + b.start_time));

    return {
        data: slots,
        meta: { month: month + 1, year, total_slots: slots.length, user_niveau: userNiveau },
    };
}
