//upravlja navigacijom kroz aplikaciju

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),  //import()- dinamicki import,
  },                                                                          // asinhrona operacija - kada se ucita,
                                                                              // uradi sledece
  //Ako korisnik ode na /home, dinamički učitaj fajl home.page.ts i prikaži komponentu HomePage
  
  //ako korisnik otvori početnu adresu (http://localhost:8100), prebaci ga na http://localhost:8100/home
  { 
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  //automatski dodata ruta nakon kreiranja login page
  {
    path: 'login',
    loadComponent: () => import('./features/authentication/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/authentication/register/register.page').then( m => m.RegisterPage)
  },
];
