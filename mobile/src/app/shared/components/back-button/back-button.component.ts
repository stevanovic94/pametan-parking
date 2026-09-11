import { Component, Input } from '@angular/core';
import { IonBackButton, IonButtons } from '@ionic/angular';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  imports: [IonButtons, IonBackButton],
  host: {
    slot: 'start',
  },
})
export class BackButtonComponent {
  @Input() defaultHref = '/home';
}
