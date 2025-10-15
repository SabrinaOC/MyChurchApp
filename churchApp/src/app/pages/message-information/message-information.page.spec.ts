import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageInformationPage } from './message-information.page';

describe('MessageInformationPage', () => {
  let component: MessageInformationPage;
  let fixture: ComponentFixture<MessageInformationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageInformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
