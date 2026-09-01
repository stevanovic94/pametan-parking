import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { inject } from '@angular/core';

import { AuthSessionService } from '../core/auth/auth-session.service';

@Component({
  selector: 'app-home',           //HTML naziv kojim se ta komponenta moze koristiti
  templateUrl: 'home.page.html',  //HTML izgled ove komponente nalazi se u fajlu home.page.html
  styleUrls: ['home.page.scss'],  //Stilovi za ovu komponentu nalaze se u home.page.scss
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {           //export znači da ova klasa može da se koristi iz drugih fajlova
  readonly authSession =
    inject(AuthSessionService);
}
