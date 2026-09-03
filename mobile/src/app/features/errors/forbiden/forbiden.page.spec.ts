import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForbidenPage } from './forbiden.page';

describe('ForbidenPage', () => {
  let component: ForbidenPage;
  let fixture: ComponentFixture<ForbidenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForbidenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
