import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShowSelectedUserComponent } from './dialog-show-selected-user.component';

describe('DialogShowSelectedUserComponent', () => {
  let component: DialogShowSelectedUserComponent;
  let fixture: ComponentFixture<DialogShowSelectedUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShowSelectedUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogShowSelectedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
