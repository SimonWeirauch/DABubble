import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUserProfileComponent } from './dialog-user-profile.component';

describe('DialogUserProfileComponent', () => {
  let component: DialogUserProfileComponent;
  let fixture: ComponentFixture<DialogUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUserProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
