import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AuthSessionService,
} from './auth-session.service';

import {
  AuthStorageService,
} from './auth-storage.service';

import {
  AuthResponse,
} from './models/auth-response.model';


describe(
  'AuthSessionService',
  () => {

    let service:
      AuthSessionService;


    const authStorageMock = {

      saveRefreshToken:
        vi.fn(),

      clearRefreshToken:
        vi.fn(),
    };


    const response:
      AuthResponse = {

      accessToken:
        'access-token',

      refreshToken:
        'refresh-token',

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
          'USER',

        isActive:
          true,

        createdAt:
          '2026-09-04T08:00:00.000Z',

        updatedAt:
          '2026-09-04T08:00:00.000Z',
      },
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


      service =
        new AuthSessionService(
          authStorageMock as unknown as AuthStorageService,
        );
    });


    it(
      'should start without authenticated user',
      () => {

        expect(
          service.isAuthenticated(),
        ).toBe(false);


        expect(
          service.accessToken(),
        ).toBeNull();


        expect(
          service.refreshToken(),
        ).toBeNull();


        expect(
          service.user(),
        ).toBeNull();
      },
    );


    it(
      'should store authenticated session',
      () => {

        service.setSession(
          response,
        );


        expect(
          service.accessToken(),
        ).toBe(
          'access-token',
        );


        expect(
          service.refreshToken(),
        ).toBe(
          'refresh-token',
        );


        expect(
          service.user()?.email,
        ).toBe(
          'petar@test.com',
        );


        expect(
          service.isAuthenticated(),
        ).toBe(true);


        expect(
          authStorageMock
            .saveRefreshToken,
        ).toHaveBeenCalledWith(
          'refresh-token',
        );
      },
    );


    it(
      'should update tokens and keep user',
      () => {

        service.setSession(
          response,
        );


        service.updateTokens(
          'access-token-2',
          'refresh-token-2',
        );


        expect(
          service.accessToken(),
        ).toBe(
          'access-token-2',
        );


        expect(
          service.refreshToken(),
        ).toBe(
          'refresh-token-2',
        );


        expect(
          service.user()?.email,
        ).toBe(
          'petar@test.com',
        );


        expect(
          authStorageMock
            .saveRefreshToken,
        ).toHaveBeenLastCalledWith(
          'refresh-token-2',
        );
      },
    );


    it(
      'should clear authenticated session',
      () => {

        service.setSession(
          response,
        );


        service.clearSession();


        expect(
          service.accessToken(),
        ).toBeNull();


        expect(
          service.refreshToken(),
        ).toBeNull();


        expect(
          service.user(),
        ).toBeNull();


        expect(
          service.isAuthenticated(),
        ).toBe(false);


        expect(
          authStorageMock
            .clearRefreshToken,
        ).toHaveBeenCalled();
      },
    );
  },
);