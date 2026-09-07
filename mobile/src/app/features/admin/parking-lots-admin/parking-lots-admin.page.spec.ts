import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ParkingLotsAdminPage } from './parking-lots-admin.page';

describe('ParkingLotsAdminPage', () => {
  let component: ParkingLotsAdminPage;
  let fixture: ComponentFixture<ParkingLotsAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingLotsAdminPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingLotsAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});