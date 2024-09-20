import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddAdditionalMemberComponent } from './dialog-add-additional-member.component';

describe('DialogAddAdditionalMemberComponent', () => {
  let component: DialogAddAdditionalMemberComponent;
  let fixture: ComponentFixture<DialogAddAdditionalMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddAdditionalMemberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddAdditionalMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
