import { Component, } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton } from '@ionic/angular';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [
    BackButtonComponent,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButtons, LogoutButtonComponent, RouterLink, IonButton]
})
export class AdminDashboardPage { 
  
}
