import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParkingLotsPage } from './parking-lots.page';

describe('ParkingLotsPage', () => {
  let component: ParkingLotsPage;
  let fixture: ComponentFixture<ParkingLotsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingLotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
