import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-forbiden',
  templateUrl: './forbidden.page.html',
  styleUrls: ['./forbidden.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, RouterLink, IonButtons, LogoutButtonComponent]
})
export class ForbiddenPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
