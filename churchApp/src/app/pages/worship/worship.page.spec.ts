import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorshipPage } from './worship.page';

describe('WorshipPage', () => {
  let component: WorshipPage;
  let fixture: ComponentFixture<WorshipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorshipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
