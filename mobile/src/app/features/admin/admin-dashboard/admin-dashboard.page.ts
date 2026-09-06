import { Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, } from '@ionic/angular';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButtons, LogoutButtonComponent]
})
export class AdminDashboardPage {

  constructor() { }


}
