import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
} from "@ionic/angular";
import { LogoutButtonComponent } from "../../../shared/components/logout-button/logout-button.component";
import { BackButtonComponent } from "../../../shared/components/back-button/back-button.component";

@Component({
	selector: "app-operator-dashboard",
	templateUrl: "./operator-dashboard.page.html",
	styleUrls: ["./operator-dashboard.page.scss"],
	imports: [
    BackButtonComponent,
		RouterLink,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonButtons,
		IonContent,
		IonButton,
		LogoutButtonComponent,
	],
})
export class OperatorDashboardPage {}
