import type { Slot, SlotsApiResponse } from '@/types';

// ── Formule catalog (calendar-visible only — "SI inscription" products excluded) ──

const FORMULE_CATALOG = [
    // Slot-type (single calendar entry)
    { stripe_product_id: 'prod_001', product_name: '5 à 8 - Découvrir la voile',                          type: 'slot'    as const, format: 'Soirée',             niveaux: ['DEB'],                                    max_spots: 4,  duree_heures: 4,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 20 },
    { stripe_product_id: 'prod_002', product_name: 'Balade à Voile',                                       type: 'slot'    as const, format: 'Journalier',         niveaux: ['IN2'],                                    max_spots: 4,  duree_heures: 7,    lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_003', product_name: 'Initiation à la Navigation de Nuit',                   type: 'slot'    as const, format: 'Soirée',             niveaux: ['VE4'],                                    max_spots: 4,  duree_heures: 5,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 22 },
    { stripe_product_id: 'prod_004', product_name: 'Journée de Navigation - manoeuvres complexes',         type: 'slot'    as const, format: 'Journalier',         niveaux: ['VE3', 'VE4'],                             max_spots: 4,  duree_heures: 7,    lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_005', product_name: 'Journée de Navigation - manoeuvres élémentaire',       type: 'slot'    as const, format: 'Journalier',         niveaux: ['IN1', 'IN2'],                             max_spots: 4,  duree_heures: 7,    lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_006', product_name: 'Manoeuvre de Port & Pilotage',                         type: 'slot'    as const, format: 'Soirée',             niveaux: ['MP1', 'MP2', 'MP3', 'MP4'],               max_spots: 4,  duree_heures: 3,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 20 },
    { stripe_product_id: 'prod_007', product_name: 'Pratique de Navigation - Soirée',                      type: 'slot'    as const, format: 'Soirée',             niveaux: ['IN2', 'VE2'],                             max_spots: 4,  duree_heures: 3,    lieu: 'Yacht Club de Beaconsfield', start_hour: 17, end_hour: 20 },
    // Formule-type (multi-session programs)
    { stripe_product_id: 'prod_008', product_name: "Cap sur l'Instructeur IVQ et élémentaire",             type: 'formule' as const, format: 'Journée et soirée', niveaux: ['INST1','INST2','INST3','INST4','INST5','INST6'], max_spots: 4,  duree_heures: null, lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_009', product_name: "Cap sur le Yachtmaster",                               type: 'formule' as const, format: 'Voyage à Vie à bord', niveaux: ['CYACHT1','CYACHT2','CYACHT3','CYACHT4','CYACHT5','CYACHT6','CYACHT7','CYACHT8','CYACHT9','CYACHT10'], max_spots: 4, duree_heures: null, lieu: 'Destination sur mesure', start_hour: 9, end_hour: 18 },
    { stripe_product_id: 'prod_010', product_name: "Cap sur l'Avancé",                                     type: 'formule' as const, format: 'Journée et soirée', niveaux: ['CADV1','CADV2','CADV3','CADV4','CADV5'],  max_spots: 8,  duree_heures: null, lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_011', product_name: "Cap sur l'Intermédiaire",                              type: 'formule' as const, format: 'Journée et soirée', niveaux: ['CINT1','CINT2','CINT3','CINT4','CINT5'],  max_spots: 8,  duree_heures: null, lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 18 },
    { stripe_product_id: 'prod_012', product_name: 'Croisière Avancée',                                    type: 'formule' as const, format: 'Voyage à Vie à bord', niveaux: ['CADV1','CADV2','CADV3','CADV4','CADV5','CADV6','CADV7','CADV8','CADV9','CADV10'], max_spots: 4, duree_heures: null, lieu: 'Destination sur mesure', start_hour: 9, end_hour: 18 },
    { stripe_product_id: 'prod_013', product_name: 'Croisière Intermédiaire',                              type: 'formule' as const, format: 'Voyage à Vie à bord', niveaux: ['INTER1','INTER2','INTER3','INTER4','INTER5','INTER6','INTER7'], max_spots: 6, duree_heures: null, lieu: 'Destination sur mesure', start_hour: 9, end_hour: 18 },
    { stripe_product_id: 'prod_014', product_name: 'Croisière élémentaire',                                type: 'formule' as const, format: 'Journalier',         niveaux: ['EQUIEL1','EQUIEL2','EQUIEL3','EQUIEL4','VE1','VE2','VE3','VE4'], max_spots: 4, duree_heures: 32, lieu: 'Yacht Club de Beaconsfield', start_hour: 9, end_hour: 16 },
    { stripe_product_id: 'prod_015', product_name: 'Initiation à la voile',                                type: 'formule' as const, format: 'Journalier',         niveaux: ['IN1', 'IN2'],                             max_spots: 4,  duree_heures: 14,   lieu: 'Yacht Club de Beaconsfield', start_hour: 9,  end_hour: 16 },
    { stripe_product_id: 'prod_016', product_name: 'Voyage Accompagné',                                    type: 'formule' as const, format: 'Voyage à Vie à bord', niveaux: ['DEB2'],                                 max_spots: 10, duree_heures: null, lieu: 'Destination sur mesure', start_hour: 9, end_hour: 18 },
    { stripe_product_id: 'prod_017', product_name: 'Voyage en Flotille',                                   type: 'formule' as const, format: 'Voyage à Vie à bord', niveaux: ['CADV5'],                                max_spots: 8,  duree_heures: null, lieu: 'Destination sur mesure', start_hour: 9, end_hour: 18 },
    { stripe_product_id: 'prod_018', product_name: 'Voyager autrement à la voile',                         type: 'formule' as const, format: 'Voyage à Vie à bord', niveaux: ['DEB'],                                  max_spots: 10, duree_heures: null, lieu: 'Destination sur mesure', start_hour: 9, end_hour: 18 },
];

// Seeded pseudo-random to get stable mock data across renders
function seededRand(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

export function getMockSlots(month: number, year: number, userNiveau: string): SlotsApiResponse {
    const rand = seededRand(month * 100 + year);
    const slots: Slot[] = [];
    let id = 1;

    FORMULE_CATALOG.forEach((f) => {
        const count = f.type === 'slot' ? 8 : 3;
        for (let i = 0; i < count; i++) {
            const day = 1 + Math.floor(rand() * 28);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const startH  = f.start_hour;
            const endH    = f.end_hour;
            const startTime = `${String(startH).padStart(2, '0')}:00`;
            const endTime   = `${String(endH).padStart(2, '0')}:00`;
            const spotsLeft = Math.max(1, Math.floor(rand() * f.max_spots) + 1);

            slots.push({
                id: id++,
                stripe_product_id: f.stripe_product_id,
                product_name: f.product_name,
                type: f.type,
                format: f.format,
                niveaux: f.niveaux,
                date: dateStr,
                start_time: startTime,
                end_time: endTime,
                spots_remaining: spotsLeft,
                max_spots: f.max_spots,
                duree_heures: f.duree_heures,
                lieu: f.lieu,
            });
        }
    });

    // Sort by date + time
    slots.sort((a, b) => {
        const da = a.date + 'T' + a.start_time;
        const db = b.date + 'T' + b.start_time;
        return da.localeCompare(db);
    });

    return {
        data: slots,
        meta: { month: month + 1, year, total_slots: slots.length, user_niveau: userNiveau },
    };
}
