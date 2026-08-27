import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class RegisterPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
