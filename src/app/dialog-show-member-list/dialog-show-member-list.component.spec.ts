import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShowMemberListComponent } from './dialog-show-member-list.component';

describe('DialogShowMemberListComponent', () => {
  let component: DialogShowMemberListComponent;
  let fixture: ComponentFixture<DialogShowMemberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShowMemberListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogShowMemberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
