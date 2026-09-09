import { Routes } from "@angular/router";
import { authGuard } from "./core/auth/guards/auth.guard";
import { roleGuard } from "./core/auth/guards/role.guard";

export const routes: Routes = [
	{
		path: "home",
		loadComponent: () => import("./home/home.page").then((m) => m.HomePage),
		canActivate: [authGuard],
	},
	{
		path: "",
		redirectTo: "home",
		pathMatch: "full",
	},
	{
		path: "login",
		loadComponent: () =>
			import("./features/authentication/login/login.page").then(
				(m) => m.LoginPage,
			),
	},
	{
		path: "register",
		loadComponent: () =>
			import("./features/authentication/register/register.page").then(
				(m) => m.RegisterPage,
			),
	},
	{
		path: "forbidden",
		loadComponent: () =>
			import("./features/errors/forbidden/forbidden.page").then(
				(m) => m.ForbiddenPage,
			),
	},
	{
		path: "admin",
		loadComponent: () =>
			import("./features/admin/admin-dashboard/admin-dashboard.page").then(
				(m) => m.AdminDashboardPage,
			),
		canActivate: [authGuard, roleGuard],
		data: {
			roles: ["ADMIN"],
		},
	},
	{
		path: "admin/parking-lots",
		loadComponent: () =>
			import(
				"./features/admin/parking-lots-admin/parking-lots-admin.page"
			).then((m) => m.ParkingLotsAdminPage),
		canActivate: [authGuard, roleGuard],
		data: {
			roles: ["ADMIN"],
		},
	},
	{
		path: "admin/parking-lots/:parkingLotId/spaces",
		loadComponent: () =>
			import(
				"./features/admin/parking-spaces-admin/parking-spaces-admin.page"
			).then((m) => m.ParkingSpacesAdminPage),
		canActivate: [authGuard, roleGuard],
		data: {
			roles: ["ADMIN"],
		},
	},
	{
		path: "parking-lots",
		loadComponent: () =>
			import("./features/parking/parking-lots/parking-lots.page").then(
				(m) => m.ParkingLotsPage,
			),
	},
	{
		path: "parking-lot-details",
		loadComponent: () =>
			import(
				"./features/parking/parking-lot-details/parking-lot-details.page"
			).then((m) => m.ParkingLotDetailsPage),
	},
	{
		path: "parking-lots",
		loadComponent: () =>
			import("./features/parking/parking-lots/parking-lots.page").then(
				(m) => m.ParkingLotsPage,
			),
		canActivate: [authGuard],
	},
	{
		path: "parking-lots/:parkingLotId",
		loadComponent: () =>
			import(
				"./features/parking/parking-lot-details/parking-lot-details.page"
			).then((m) => m.ParkingLotDetailsPage),
		canActivate: [authGuard],
	},
	{
		path: "create-reservation",
		loadComponent: () =>
			import(
				"./features/reservations/create-reservation/create-reservation.page"
			).then((m) => m.CreateReservationPage),
	},
	{
		path: "my-reservations",
		loadComponent: () =>
			import(
				"./features/reservations/my-reservations/my-reservations.page"
			).then((m) => m.MyReservationsPage),
	},
	{
		path: "parking-spaces/:parkingSpaceId/reserve",
		loadComponent: () =>
			import(
				"./features/reservations/create-reservation/create-reservation.page"
			).then((m) => m.CreateReservationPage),
		canActivate: [authGuard],
	},
	{
		path: "my-reservations",
		loadComponent: () =>
			import(
				"./features/reservations/my-reservations/my-reservations.page"
			).then((m) => m.MyReservationsPage),
		canActivate: [authGuard],
	},
	{
		path: "my-parking-events",
		loadComponent: () =>
			import(
				"./features/parking-events/my-parking-events/my-parking-events.page"
			).then((m) => m.MyParkingEventsPage),
	},
	{
		path: "parking-events/my",
		loadComponent: () =>
			import(
				"./features/parking-events/my-parking-events/my-parking-events.page"
			).then((m) => m.MyParkingEventsPage),
		canActivate: [authGuard],
	},
];
