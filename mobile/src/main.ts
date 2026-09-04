import {
  inject,
  provideAppInitializer,
} from '@angular/core';

import {
  bootstrapApplication,
} from '@angular/platform-browser';

import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular';

import {
  AppComponent,
} from './app/app.component';

import {
  routes,
} from './app/app.routes';

import {
  authInterceptor,
} from './app/core/auth/auth.interceptor';

import {
  AuthBootstrapService,
} from './app/core/auth/auth-bootstrap.service';


bootstrapApplication(
  AppComponent,
  {
    providers: [

      {
        provide:
          RouteReuseStrategy,

        useClass:
          IonicRouteStrategy,
      },


      provideIonicAngular(),


      provideRouter(
        routes,
        withPreloading(
          PreloadAllModules,
        ),
      ),


      provideHttpClient(
        withInterceptors([
          authInterceptor,
        ]),
      ),


      /*
       * Angular čeka da initialize()
       * završi pre završetka startovanja
       * aplikacije i route guard provera.
       */
      provideAppInitializer(
        () =>
          inject(
            AuthBootstrapService,
          ).initialize(),
      ),

    ],
  },
);