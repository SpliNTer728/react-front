export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role: string;
    actif: boolean;
    niveau?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type ViewMode = 'month' | 'week' | 'list';

export type Slot = {
    id: number;
    stripe_product_id: string;
    product_name: string;
    type: 'slot' | 'formule';
    format: string;
    niveaux: string[];
    date: string;         // ISO date string: "2026-06-15"
    start_time: string;   // "HH:mm"
    end_time: string;
    spots_remaining: number;
    max_spots: number;
    duree_heures: number | null;
    lieu: string;
};

export type SlotsApiResponse = {
    data: Slot[];
    meta: {
        month: number;
        year: number;
        total_slots: number;
        user_niveau: string;
    };
};

export type Auth = {
    user: User;
};

export type ApiError = {
    message: string;
    errors?: Record<string, string[]>;
};
