import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ParkingSpacesAdminPage } from './parking-spaces-admin.page';

describe('ParkingSpacesAdminPage', () => {
  let component: ParkingSpacesAdminPage;
  let fixture: ComponentFixture<ParkingSpacesAdminPage>;

  const activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({
        parkingLotId: 'parking-1',
      }),
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingSpacesAdminPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingSpacesAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});