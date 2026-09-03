import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-forbiden',
  templateUrl: './forbiden.page.html',
  styleUrls: ['./forbiden.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton]
})
export class ForbidenPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
