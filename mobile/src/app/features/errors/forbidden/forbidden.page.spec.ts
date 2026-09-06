import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import {
  provideHttpClient,
} from '@angular/common/http';

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
  ForbiddenPage,
} from './forbidden.page';


describe('ForbiddenPage', () => {

  let component:
    ForbiddenPage;

  let fixture:
    ComponentFixture<ForbiddenPage>;


  beforeEach(async () => {

    await TestBed
      .configureTestingModule({

        imports: [
          ForbiddenPage,
        ],

        providers: [
          provideHttpClient(),
          provideRouter([]),
        ],

      })
      .compileComponents();


    fixture =
      TestBed.createComponent(
        ForbiddenPage,
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });


  it('should create', () => {

    expect(
      component,
    ).toBeTruthy();

  });
});