import {
    HttpClient,
    HttpParams,
} from '@angular/common/http';

import {
    inject,
    Injectable,
} from '@angular/core';

import {
    Observable,
} from 'rxjs';

import {
    environment,
} from '../../../environments/environment';

import {
    CreateParkingLotRequest,
} from './models/create-parking-lot-request.model';

import {
    CreateParkingSpaceRequest,
} from './models/create-parking-space-request.model';

import {
    ParkingLot,
} from './models/parking-lot.model';

import {
    ParkingSpace,
} from './models/parking-space.model';

import {
    UpdateParkingLotRequest,
} from './models/update-parking-lot-request.model';

import {
    UpdateParkingSpaceRequest,
} from './models/update-parking-space-request.model';


@Injectable({
    providedIn: 'root',
})
export class ParkingService {

    private readonly http = inject(HttpClient);


    private readonly apiUrl = environment.apiUrl;


    getParkingLots():
        Observable<ParkingLot[]> {

        return this.http.get<ParkingLot[]>(
            `${this.apiUrl}/parking-lots`,
        );
    }


    getAdminParkingLots():
        Observable<ParkingLot[]> {

        return this.http.get<ParkingLot[]>(
            `${this.apiUrl}/parking-lots/admin`,
        );
    }


    createParkingLot(
        request:
            CreateParkingLotRequest,
    ): Observable<ParkingLot> {

        return this.http.post<ParkingLot>(
            `${this.apiUrl}/parking-lots`,
            request,
        );
    }


    updateParkingLot(
        id: string,
        request:
            UpdateParkingLotRequest,
    ): Observable<ParkingLot> {

        return this.http.patch<ParkingLot>(
            `${this.apiUrl}/parking-lots/${id}`,
            request,
        );
    }


    deactivateParkingLot(
        id: string,
    ): Observable<{
        message: string;
        parkingLot: ParkingLot;
    }> {

        return this.http.delete<{
            message: string;
            parkingLot: ParkingLot;
        }>(
            `${this.apiUrl}/parking-lots/${id}`,
        );
    }


    getAdminParkingSpaces(
        parkingLotId: string,
    ): Observable<ParkingSpace[]> {

        const params =
            new HttpParams().set(
                'parkingLotId',
                parkingLotId,
            );


        return this.http.get<ParkingSpace[]>(
            `${this.apiUrl}/parking-spaces/admin`,
            {
                params,
            },
        );
    }


    createParkingSpace(
        request:
            CreateParkingSpaceRequest,
    ): Observable<ParkingSpace> {

        return this.http.post<ParkingSpace>(
            `${this.apiUrl}/parking-spaces`,
            request,
        );
    }


    updateParkingSpace(
        id: string,
        request:
            UpdateParkingSpaceRequest,
    ): Observable<ParkingSpace> {

        return this.http.patch<ParkingSpace>(
            `${this.apiUrl}/parking-spaces/${id}`,
            request,
        );
    }


    deactivateParkingSpace(
        id: string,
    ): Observable<{
        message: string;
        parkingSpace: ParkingSpace;
    }> {

        return this.http.delete<{
            message: string;
            parkingSpace: ParkingSpace;
        }>(
            `${this.apiUrl}/parking-spaces/${id}`,
        );
    }
}