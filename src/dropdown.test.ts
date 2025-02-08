// avatar-dropdown.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import AvatarDropdown from '$lib/components/dropdown.svelte';  // Fixed import path
import { loggedIn } from './stores/loggedInStores';
import { username } from './stores/user';  // Fixed import path

// Mock modules
vi.mock('svelte-sonner', () => ({
    toast: {
        success: vi.fn(),
    },
}));

vi.mock('$app/navigation', () => ({
    goto: vi.fn(),
}));

// Helper function moved to top level
function getInitials(name: string) {
    if (!name) return '';
    return name
        .split(' ')
        .map((part) => part[0].toUpperCase())
        .join('');
}

describe('AvatarDropdown', () => {
    const mockUsername = 'Test User';
    const mockInitials = getInitials(mockUsername);

    beforeEach(() => {
        username.set(mockUsername);
        loggedIn.set(true);
        vi.clearAllMocks();
    });

    afterEach(() => {
        loggedIn.set(false);
        username.set('');
    });

    it('should display user initials in avatar', () => {
        render(AvatarDropdown);
        const avatar = screen.getByTestId('avatar-fallback');
        expect(avatar).toHaveTextContent(mockInitials);
    });

    it('should open dropdown menu when clicked', async () => {
        render(AvatarDropdown);

        const trigger = screen.getByRole('button');
        await userEvent.click(trigger);

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    it('should navigate to profile when profile item is clicked', async () => {
        const { goto } = await import('$app/navigation');
        render(AvatarDropdown);

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByText('Profile'));

        expect(goto).toHaveBeenCalledWith('/Profile');
    });

    it('should log out when logout item is clicked', async () => {
        const { toast } = await import('svelte-sonner');
        render(AvatarDropdown);

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByText('Log Out'));

        expect(get(loggedIn)).toBe(false);  // Use get() from svelte/store
        expect(toast.success).toHaveBeenCalledWith('Logged Out successfully!');
    });

    it('should update initials when username changes', () => {
        const newUsername = 'New Test Name';
        username.set(newUsername);

        render(AvatarDropdown);
        const avatar = screen.getByTestId('avatar-fallback');

        expect(avatar).toHaveTextContent(getInitials(newUsername));
    });

    it('should display empty initials when no username', () => {
        username.set('');

        render(AvatarDropdown);
        const avatar = screen.getByTestId('avatar-fallback');

        expect(avatar).toHaveTextContent('');
    });
});