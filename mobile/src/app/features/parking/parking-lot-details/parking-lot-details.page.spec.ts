import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParkingLotDetailsPage } from './parking-lot-details.page';

describe('ParkingLotDetailsPage', () => {
  let component: ParkingLotDetailsPage;
  let fixture: ComponentFixture<ParkingLotDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingLotDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
