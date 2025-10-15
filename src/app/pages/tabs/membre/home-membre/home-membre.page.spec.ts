import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeMembrePage } from './home-membre.page';

describe('HomeMembrePage', () => {
  let component: HomeMembrePage;
  let fixture: ComponentFixture<HomeMembrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeMembrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
