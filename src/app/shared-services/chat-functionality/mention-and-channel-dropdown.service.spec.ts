import { TestBed } from '@angular/core/testing';

import { MentionAndChannelDropdownService } from './mention-and-channel-dropdown.service';

describe('MentionAndChannelDropdownService', () => {
  let service: MentionAndChannelDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentionAndChannelDropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
