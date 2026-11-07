import { TestBed } from '@angular/core/testing';

import { GiftCrud } from './gift-crud';

describe('GiftCrud', () => {
  let service: GiftCrud;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GiftCrud);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
