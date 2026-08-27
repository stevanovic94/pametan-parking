import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
// uvoz komponenti iz Ionic biblioteke
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';
                                
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  //dozvole komponentama da koriste se koriste u HTML-u stranici 
  imports: [IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]                                  
})
export class LoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
