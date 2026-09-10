import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ParkingSpace } from "../../../../core/parking/models/parking-space.model";

type ParkingSpaceDisplayStatus = "FREE" | "OCCUPIED" | "UNKNOWN" | "RESERVED";

@Component({
	selector: "app-parking-space-grid",
	templateUrl: "./parking-space-grid.component.html",
	styleUrls: ["./parking-space-grid.component.scss"],
	imports: [RouterLink],
})
export class ParkingSpaceGridComponent {
	@Input({
		required: true,
	})
	parkingSpaces: ParkingSpace[] = [];

	getDisplayStatus(parkingSpace: ParkingSpace): ParkingSpaceDisplayStatus {
		if (
			parkingSpace.occupancyStatus === "FREE" &&
			parkingSpace.isReservedNow === true
		) {
			return "RESERVED";
		}

		return parkingSpace.occupancyStatus;
	}

	getStatusLabel(parkingSpace: ParkingSpace): string {
		switch (this.getDisplayStatus(parkingSpace)) {
			case "FREE":
				return "Slobodno";

			case "RESERVED":
				return "Rezervisano";

			case "OCCUPIED":
				return "Zauzeto";

			case "UNKNOWN":
				return "Nepoznato";
		}
	}

	getStatusClass(parkingSpace: ParkingSpace): string {
		switch (this.getDisplayStatus(parkingSpace)) {
			case "FREE":
				return "space-free";

			case "RESERVED":
				return "space-reserved";

			case "OCCUPIED":
				return "space-occupied";

			case "UNKNOWN":
				return "space-unknown";
		}
	}
}
