import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';

import {
    Router,
} from '@angular/router';

import {
    of,
} from 'rxjs';

import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    AuthService,
} from '../../../core/auth/auth.service';

import {
    AuthSessionService,
} from '../../../core/auth/auth-session.service';

import {
    LogoutButtonComponent,
} from './logout-button.component';


describe(
    'LogoutButtonComponent',
    () => {

        let component:
            LogoutButtonComponent;

        let fixture:
            ComponentFixture<LogoutButtonComponent>;


        const authServiceMock = {
            logout: vi.fn(),
        };


        const authSessionMock = {
            isAuthenticated:
                vi.fn(),

            clearSession:
                vi.fn(),
        };


        const routerMock = {
            navigateByUrl:
                vi.fn(),
        };


        beforeEach(async () => {

            vi.clearAllMocks();


            authSessionMock
                .isAuthenticated
                .mockReturnValue(true);


            authServiceMock
                .logout
                .mockReturnValue(
                    of({
                        message:
                            'Uspešno ste se odjavili.',
                    }),
                );


            routerMock
                .navigateByUrl
                .mockResolvedValue(true);


            await TestBed
                .configureTestingModule({

                    imports: [
                        LogoutButtonComponent,
                    ],

                    providers: [

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
                                Router,

                            useValue:
                                routerMock,
                        },

                    ],
                })
                .compileComponents();


            fixture =
                TestBed.createComponent(
                    LogoutButtonComponent,
                );


            component =
                fixture.componentInstance;


            fixture.detectChanges();
        });


        it(
            'should create',
            () => {

                expect(
                    component,
                ).toBeTruthy();
            },
        );


        it(
            'should clear session and navigate to login',
            () => {

                component.logout();


                expect(
                    authServiceMock.logout,
                ).toHaveBeenCalled();


                expect(
                    authSessionMock.clearSession,
                ).toHaveBeenCalled();


                expect(
                    routerMock.navigateByUrl,
                ).toHaveBeenCalledWith(
                    '/login',
                    {
                        replaceUrl: true,
                    },
                );
            },
        );
    },
);