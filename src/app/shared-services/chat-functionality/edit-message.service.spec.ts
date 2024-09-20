import { TestBed } from '@angular/core/testing';

import { EditMessageService } from './edit-message.service';

describe('EditMessageService', () => {
  let service: EditMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
