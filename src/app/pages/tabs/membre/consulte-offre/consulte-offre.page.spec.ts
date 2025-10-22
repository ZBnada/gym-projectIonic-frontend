import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsulteOffrePage } from './consulte-offre.page';

describe('ConsulteOffrePage', () => {
  let component: ConsulteOffrePage;
  let fixture: ComponentFixture<ConsulteOffrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsulteOffrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
