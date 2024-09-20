import { TestBed } from '@angular/core/testing';

import { TimeFormatingService } from './time-formating.service';

describe('TimeFormatingService', () => {
  let service: TimeFormatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeFormatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
