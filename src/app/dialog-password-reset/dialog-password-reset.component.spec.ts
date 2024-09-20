import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPasswordResetComponent } from './dialog-password-reset.component';

describe('DialogPasswordResetComponent', () => {
  let component: DialogPasswordResetComponent;
  let fixture: ComponentFixture<DialogPasswordResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPasswordResetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
