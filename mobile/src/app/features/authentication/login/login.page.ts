import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';
                                //uvoz IonInput iz Ionic biblioteke

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, CommonModule, FormsModule]
                                  //dozvoli LoginPage komponenti da koristi IonInput u svom HTML-u
})
export class LoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
