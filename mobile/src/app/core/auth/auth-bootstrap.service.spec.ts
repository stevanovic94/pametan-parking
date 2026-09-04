import {
    TestBed,
} from '@angular/core/testing';

import {
    of,
    throwError,
} from 'rxjs';

import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    AuthBootstrapService,
} from './auth-bootstrap.service';

import {
    AuthService,
} from './auth.service';

import {
    AuthSessionService,
} from './auth-session.service';

import {
    AuthStorageService,
} from './auth-storage.service';


describe(
    'AuthBootstrapService',
    () => {

        let service:
            AuthBootstrapService;


        const authServiceMock = {
            refresh:
                vi.fn(),
        };


        const authSessionMock = {
            setSession:
                vi.fn(),

            clearSession:
                vi.fn(),
        };


        const authStorageMock = {
            getRefreshToken:
                vi.fn(),

            saveRefreshToken:
                vi.fn(),

            clearRefreshToken:
                vi.fn(),
        };


        beforeEach(() => {

            vi.clearAllMocks();


            authStorageMock
                .saveRefreshToken
                .mockResolvedValue(
                    undefined,
                );


            authStorageMock
                .clearRefreshToken
                .mockResolvedValue(
                    undefined,
                );


            TestBed.configureTestingModule({
                providers: [

                    AuthBootstrapService,

                    {
                        provide:
                            AuthService,

                        useValue:
                            authServiceMock,
                    },

                    {
                        provide:
                            AuthSessionService,

                        useValue:
                            authSessionMock,
                    },

                    {
                        provide:
                            AuthStorageService,

                        useValue:
                            authStorageMock,
                    },

                ],
            });


            service =
                TestBed.inject(
                    AuthBootstrapService,
                );
        });


        it(
            'should do nothing when refresh token does not exist',
            async () => {

                authStorageMock
                    .getRefreshToken
                    .mockResolvedValue(
                        null,
                    );


                await service.initialize();


                expect(
                    authServiceMock.refresh,
                ).not.toHaveBeenCalled();


                expect(
                    authSessionMock.setSession,
                ).not.toHaveBeenCalled();
            },
        );


        it(
            'should restore saved session',
            async () => {

                authStorageMock
                    .getRefreshToken
                    .mockResolvedValue(
                        'refresh-token-1',
                    );


                const response = {

                    accessToken:
                        'access-token-2',

                    refreshToken:
                        'refresh-token-2',

                    user: {

                        id:
                            'user-id',

                        firstName:
                            'Petar',

                        lastName:
                            'Petrovic',

                        email:
                            'petar@test.com',

                        role:
                            'ADMIN' as const,

                        isActive:
                            true,

                        createdAt:
                            '2026-09-04T08:00:00.000Z',

                        updatedAt:
                            '2026-09-04T08:00:00.000Z',
                    },
                };


                authServiceMock
                    .refresh
                    .mockReturnValue(
                        of(response),
                    );


                await service.initialize();


                expect(
                    authServiceMock.refresh,
                ).toHaveBeenCalledWith({
                    refreshToken:
                        'refresh-token-1',
                });


                expect(
                    authSessionMock.setSession,
                ).toHaveBeenCalledWith(
                    response,
                );


                expect(
                    authStorageMock
                        .saveRefreshToken,
                ).toHaveBeenCalledWith(
                    'refresh-token-2',
                );
            },
        );


        it(
            'should clear invalid saved session',
            async () => {

                authStorageMock
                    .getRefreshToken
                    .mockResolvedValue(
                        'invalid-refresh-token',
                    );


                authServiceMock
                    .refresh
                    .mockReturnValue(
                        throwError(
                            () =>
                                new Error(
                                    'Refresh failed',
                                ),
                        ),
                    );


                await service.initialize();


                expect(
                    authSessionMock.clearSession,
                ).toHaveBeenCalled();


                expect(
                    authStorageMock
                        .clearRefreshToken,
                ).toHaveBeenCalled();
            },
        );
    },
);