//upravlja navigacijom kroz aplikaciju

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'home',
    //import()- dinamicki import, asinhrona operacija - kada se ucita, uradi sledece:
    //Ako korisnik ode na /home, dinamički učitaj fajl home.page.ts i prikaži komponentu HomePage
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [
      authGuard
    ]
  },


  //ako korisnik otvori početnu adresu (http://localhost:8100), prebaci ga na http://localhost:8100/home
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  //automatski dodata ruta nakon kreiranja login page
  {
    path: 'login',
    loadComponent: () => import('./features/authentication/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/authentication/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/errors/forbidden/forbidden.page').then( m => m.ForbiddenPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage),
    canActivate: [
      authGuard,    // da li je prijavljen
      roleGuard,    // da li je admin
    ],
    data: {roles:['ADMIN']}
  },
  
];
