import { writable } from 'svelte/store';

// Create a writable store
export const loggedIn = writable(false); // false means not logged in initially
