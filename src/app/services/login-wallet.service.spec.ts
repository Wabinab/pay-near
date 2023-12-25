import { TestBed } from '@angular/core/testing';

import { LoginWalletService } from './login-wallet.service';

describe('LoginWalletService', () => {
  let service: LoginWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
