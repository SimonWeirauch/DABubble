import { TestBed } from '@angular/core/testing';

import { LastTwoEmojisService } from './last-two-emojis.service';

describe('LastTwoEmojisService', () => {
  let service: LastTwoEmojisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastTwoEmojisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
