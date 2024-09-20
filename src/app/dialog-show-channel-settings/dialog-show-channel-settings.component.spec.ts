import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShowChannelSettingsComponent } from './dialog-show-channel-settings.component';

describe('DialogShowChannelSettingsComponent', () => {
  let component: DialogShowChannelSettingsComponent;
  let fixture: ComponentFixture<DialogShowChannelSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShowChannelSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogShowChannelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
