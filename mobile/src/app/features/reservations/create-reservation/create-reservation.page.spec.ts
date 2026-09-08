import {
  provideHttpClient,
} from '@angular/common/http';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideRouter,
} from '@angular/router';
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  CreateReservationPage,
} from './create-reservation.page';

describe('CreateReservationPage', () => {
  let component:
    CreateReservationPage;

  let fixture:
    ComponentFixture<CreateReservationPage>;

  beforeEach(async () => {
    await TestBed
      .configureTestingModule({
        imports: [
          CreateReservationPage,
        ],
        providers: [
          provideHttpClient(),
          provideRouter([]),
        ],
      })
      .compileComponents();

    fixture =
      TestBed.createComponent(
        CreateReservationPage,
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});