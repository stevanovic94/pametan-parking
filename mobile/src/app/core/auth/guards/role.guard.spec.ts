import {
    TestBed
} from '@angular/core/testing';

import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';

import {
    beforeEach,
    describe,
    expect,
    it,
    vi
} from 'vitest';

import { AuthSessionService } from '../auth-session.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {

    const authSessionMock = {
        isAuthenticated: vi.fn(),
        user: vi.fn()
    };

    const forbiddenUrlTree =
        {} as UrlTree;

    const routerMock = {
        createUrlTree: vi.fn()
    };

    beforeEach(() => {

        authSessionMock
            .isAuthenticated
            .mockReset();

        authSessionMock
            .user
            .mockReset();

        routerMock
            .createUrlTree
            .mockReset();

        routerMock
            .createUrlTree
            .mockReturnValue(
                forbiddenUrlTree
            );

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AuthSessionService,
                    useValue: authSessionMock
                },
                {
                    provide: Router,
                    useValue: routerMock
                }
            ]
        });
    });

    it(
        'should allow ADMIN on ADMIN route',
        () => {

            authSessionMock
                .isAuthenticated
                .mockReturnValue(true);

            authSessionMock
                .user
                .mockReturnValue({
                    role: 'ADMIN'
                });

            const route = {
                data: {
                    roles: [
                        'ADMIN'
                    ]
                }
            } as unknown as ActivatedRouteSnapshot;

            const result =
                TestBed.runInInjectionContext(
                    () =>
                        roleGuard(
                            route,
                            {} as RouterStateSnapshot
                        )
                );

            expect(result).toBe(true);
        }
    );

    it(
        'should reject USER on ADMIN route',
        () => {

            authSessionMock
                .isAuthenticated
                .mockReturnValue(true);

            authSessionMock
                .user
                .mockReturnValue({
                    role: 'USER'
                });

            const route = {
                data: {
                    roles: [
                        'ADMIN'
                    ]
                }
            } as unknown as ActivatedRouteSnapshot;

            const result =
                TestBed.runInInjectionContext(
                    () =>
                        roleGuard(
                            route,
                            {} as RouterStateSnapshot
                        )
                );

            expect(result)
                .toBe(forbiddenUrlTree);

            expect(
                routerMock.createUrlTree
            ).toHaveBeenCalledWith([
                '/forbidden'
            ]);
        }
    );
});