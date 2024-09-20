import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddMembersFromSettingsComponent } from './dialog-add-members-from-settings.component';

describe('DialogAddMembersFromSettingsComponent', () => {
  let component: DialogAddMembersFromSettingsComponent;
  let fixture: ComponentFixture<DialogAddMembersFromSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddMembersFromSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddMembersFromSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
