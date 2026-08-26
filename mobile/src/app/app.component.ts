// glavna/root komponenta cele aplikacije - predstavlja okvir u kome se sve stranice prikazuju

import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
          // IonApp - predstavlja glavni Ionic kontejner cele aplikacije
 // IonRouterOutlet - predstavlja mesto gde Ionic prikazuje trenutno aktivnu stranicu

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {}
}
