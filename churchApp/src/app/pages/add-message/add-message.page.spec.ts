import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMessagePage } from './add-message.page';

describe('AddMessagePage', () => {
  let component: AddMessagePage;
  let fixture: ComponentFixture<AddMessagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMessagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
