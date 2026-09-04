import {
  TestBed,
} from '@angular/core/testing';

import {
  Subject,
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AuthRefreshService,
} from './auth-refresh.service';

import {
  AuthService,
} from './auth.service';

import {
  AuthSessionService,
} from './auth-session.service';

import {
  RefreshResponse,
} from './models/refresh-response.model';


describe(
  'AuthRefreshService',
  () => {

    let service:
      AuthRefreshService;


    const authServiceMock = {
      refresh:
        vi.fn(),
    };


    const authSessionMock = {

      refreshToken:
        vi.fn(),

      setSession:
        vi.fn(),

      clearSession:
        vi.fn(),
    };


    beforeEach(() => {

      vi.clearAllMocks();


      TestBed.configureTestingModule({
        providers: [

          AuthRefreshService,

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

        ],
      });


      service =
        TestBed.inject(
          AuthRefreshService,
        );
    });


    it(
      'should share one refresh request between concurrent calls',
      () => {

        authSessionMock
          .refreshToken
          .mockReturnValue(
            'refresh-token-1',
          );


        const refreshSubject =
          new Subject<RefreshResponse>();


        authServiceMock
          .refresh
          .mockReturnValue(
            refreshSubject.asObservable(),
          );


        const receivedTokens:
          string[] = [];


        service
          .refreshAccessToken()
          .subscribe(
            (token) =>
              receivedTokens.push(
                token,
              ),
          );


        service
          .refreshAccessToken()
          .subscribe(
            (token) =>
              receivedTokens.push(
                token,
              ),
          );


        expect(
          authServiceMock.refresh,
        ).toHaveBeenCalledTimes(1);


        const refreshResponse:
          RefreshResponse = {

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
              'USER',

            isActive:
              true,

            createdAt:
              '2026-09-04T08:00:00.000Z',

            updatedAt:
              '2026-09-04T08:00:00.000Z',
          },
        };


        refreshSubject.next(
          refreshResponse,
        );

        refreshSubject.complete();


        expect(
          receivedTokens,
        ).toEqual([
          'access-token-2',
          'access-token-2',
        ]);


        expect(
          authSessionMock.setSession,
        ).toHaveBeenCalledWith(
          refreshResponse,
        );
      },
    );


    it(
      'should clear session when refresh token does not exist',
      () => {

        authSessionMock
          .refreshToken
          .mockReturnValue(null);


        service
          .refreshAccessToken()
          .subscribe({
            error: () => {
              // očekivana greška
            },
          });


        expect(
          authSessionMock.clearSession,
        ).toHaveBeenCalled();


        expect(
          authServiceMock.refresh,
        ).not.toHaveBeenCalled();
      },
    );
  },
);