import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembreHomePage } from './membre-home.page';

describe('MembreHomePage', () => {
  let component: MembreHomePage;
  let fixture: ComponentFixture<MembreHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
