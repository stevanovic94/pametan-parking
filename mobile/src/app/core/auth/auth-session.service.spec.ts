import {
    beforeEach,
    describe,
    expect,
    it
} from 'vitest';

import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {

    let service: AuthSessionService;

    beforeEach(() => {
        service =
            new AuthSessionService();
    });

    it('should start without authenticated user', () => {

        expect(
            service.isAuthenticated()
        ).toBe(false);

        expect(
            service.accessToken()
        ).toBeNull();

        expect(
            service.refreshToken()
        ).toBeNull();

        expect(
            service.user()
        ).toBeNull();
    });

    it('should store authenticated session', () => {

        service.setSession({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',

            user: {
                id: 'user-id',
                firstName: 'Petar',
                lastName: 'Petrovic',
                email: 'petar@test.com',
                role: 'USER',
                isActive: true,
                createdAt: '2026-09-01T10:00:00.000Z',
                updatedAt: '2026-09-01T10:00:00.000Z'
            }
        });

        expect(
            service.isAuthenticated()
        ).toBe(true);

        expect(
            service.accessToken()
        ).toBe('access-token');

        expect(
            service.refreshToken()
        ).toBe('refresh-token');

        expect(
            service.user()?.email
        ).toBe('petar@test.com');
    });

    it('should clear authenticated session', () => {

        service.setSession({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',

            user: {
                id: 'user-id',
                firstName: 'Petar',
                lastName: 'Petrovic',
                email: 'petar@test.com',
                role: 'USER',
                isActive: true,
                createdAt: '2026-09-01T10:00:00.000Z',
                updatedAt: '2026-09-01T10:00:00.000Z'
            }
        });

        service.clearSession();

        expect(
            service.isAuthenticated()
        ).toBe(false);

        expect(
            service.accessToken()
        ).toBeNull();

        expect(
            service.refreshToken()
        ).toBeNull();

        expect(
            service.user()
        ).toBeNull();
    });
});