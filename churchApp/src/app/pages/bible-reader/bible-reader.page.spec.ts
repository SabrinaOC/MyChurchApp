import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BibleReaderPage } from './bible-reader.page';

describe('BibleReaderPage', () => {
  let component: BibleReaderPage;
  let fixture: ComponentFixture<BibleReaderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BibleReaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
