import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OffersListPage } from './offers-list.page';

describe('OffersListPage', () => {
  let component: OffersListPage;
  let fixture: ComponentFixture<OffersListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OffersListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
