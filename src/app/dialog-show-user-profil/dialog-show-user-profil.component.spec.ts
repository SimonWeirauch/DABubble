import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShowUserProfilComponent } from './dialog-show-user-profil.component';

describe('DialogShowUserProfilComponent', () => {
  let component: DialogShowUserProfilComponent;
  let fixture: ComponentFixture<DialogShowUserProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShowUserProfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogShowUserProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
