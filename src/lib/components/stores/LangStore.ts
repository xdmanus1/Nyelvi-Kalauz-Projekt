import { writable, get } from 'svelte/store';
import { authStore } from './AuthStore';
import { browser } from '$app/environment';

interface LanguagePair {
    from: string;
    to: string;
}

function createLanguageStore() {
    const { subscribe, set } = writable<LanguagePair | null>(null);

    return {
        subscribe,
        setLanguage: async (languagePair: LanguagePair) => {
            await authStore.updateUserLanguage(languagePair);
            set(languagePair);
            if (browser) {
                localStorage.setItem('selectedLanguage', JSON.stringify(languagePair));
            }
        },
        initialize: () => {
            const state = get(authStore);
            if (state?.user?.user_metadata?.language_from && state?.user?.user_metadata?.language_to) {
                set({
                    from: state.user.user_metadata.language_from,
                    to: state.user.user_metadata.language_to
                });
            } else if (browser) {
                // Only check localStorage in browser environment
                const stored = localStorage.getItem('selectedLanguage');
                if (stored) {
                    try {
                        set(JSON.parse(stored));
                    } catch (e) {
                        console.error('Failed to parse stored language preference');
                    }
                }
            }
        }
    };
}

export const languageStore = createLanguageStore();