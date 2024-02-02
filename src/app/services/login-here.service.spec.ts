import { TestBed } from '@angular/core/testing';

import { LoginHereService } from './login-here.service';

describe('LoginHereService', () => {
  let service: LoginHereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginHereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
