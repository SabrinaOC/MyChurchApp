import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BibleReferencePage } from './bible-reference.page';

describe('BibleReferencePage', () => {
  let component: BibleReferencePage;
  let fixture: ComponentFixture<BibleReferencePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BibleReferencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
