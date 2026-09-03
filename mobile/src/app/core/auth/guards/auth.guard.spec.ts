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
import { authGuard } from './auth.guard';

describe('authGuard', () => {

    const authSessionMock = {
        isAuthenticated: vi.fn()
    };

    const loginUrlTree =
        {} as UrlTree;

    const routerMock = {
        createUrlTree: vi.fn()
    };

    beforeEach(() => {

        authSessionMock
            .isAuthenticated
            .mockReset();

        routerMock
            .createUrlTree
            .mockReset();

        routerMock
            .createUrlTree
            .mockReturnValue(
                loginUrlTree
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
        'should allow authenticated user',
        () => {

            authSessionMock
                .isAuthenticated
                .mockReturnValue(true);

            const result =
                TestBed.runInInjectionContext(
                    () =>
                        authGuard(
                            {} as ActivatedRouteSnapshot,
                            {} as RouterStateSnapshot
                        )
                );

            expect(result).toBe(true);
        }
    );

    it(
        'should redirect unauthenticated user to login',
        () => {

            authSessionMock
                .isAuthenticated
                .mockReturnValue(false);

            const result =
                TestBed.runInInjectionContext(
                    () =>
                        authGuard(
                            {} as ActivatedRouteSnapshot,
                            {} as RouterStateSnapshot
                        )
                );

            expect(result)
                .toBe(loginUrlTree);

            expect(
                routerMock.createUrlTree
            ).toHaveBeenCalledWith([
                '/login'
            ]);
        }
    );
});