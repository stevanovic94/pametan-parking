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
  MyReservationsPage,
} from './my-reservations.page';

describe('MyReservationsPage', () => {
  let component:
    MyReservationsPage;

  let fixture:
    ComponentFixture<MyReservationsPage>;

  beforeEach(async () => {
    await TestBed
      .configureTestingModule({
        imports: [
          MyReservationsPage,
        ],
        providers: [
          provideHttpClient(),
          provideRouter([]),
        ],
      })
      .compileComponents();

    fixture =
      TestBed.createComponent(
        MyReservationsPage,
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});