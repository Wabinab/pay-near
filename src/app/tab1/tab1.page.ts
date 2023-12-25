import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginWalletService } from '../services/login-wallet.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  
  myForm: any;
  qr_finalized: boolean = false;

  constructor(private fb: FormBuilder, private walletSvc: LoginWalletService) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      qr_data: [0, Validators.required]
    });
  }

  handle_refresh(event: any) {
    
  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
  }

  get qr_data() {
    return this.myForm.get('qr_data')!.value.toString();
  }

  lock_price() {
    this.qr_finalized = true;
    this.myForm.get('qr_data').disable();
  }

  unlock_price() {
    this.qr_finalized = false;
    this.myForm.get('qr_data').enable();
  }
}
