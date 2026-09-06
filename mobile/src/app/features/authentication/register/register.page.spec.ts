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
  RegisterPage,
} from './register.page';


describe('RegisterPage', () => {

  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;


  beforeEach(async () => {

    await TestBed
      .configureTestingModule({

        imports: [
          RegisterPage,
        ],

        providers: [
          provideHttpClient(),
          provideRouter([]),
        ],

      })
      .compileComponents();


    fixture =
      TestBed.createComponent(
        RegisterPage,
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