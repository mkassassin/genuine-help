/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GetHelpActionComponent } from './get-help-action.component';

describe('GetHelpActionComponent', () => {
  let component: GetHelpActionComponent;
  let fixture: ComponentFixture<GetHelpActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetHelpActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetHelpActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
