// src/routes/learning/+page.server.js
import { supabase } from '$lib/supabaseClient';

export async function load() {
    const { data, error } = await supabase
        .from('Cards for learning')
        .select('*');

    if (error) {
        console.error('Error fetching cards:', error);
        return { cards: [] };
    }
    return { cards: data ?? [] };
}
