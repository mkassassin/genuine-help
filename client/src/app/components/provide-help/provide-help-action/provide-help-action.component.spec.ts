/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProvideHelpActionComponent } from './provide-help-action.component';

describe('ProvideHelpActionComponent', () => {
  let component: ProvideHelpActionComponent;
  let fixture: ComponentFixture<ProvideHelpActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvideHelpActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvideHelpActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
