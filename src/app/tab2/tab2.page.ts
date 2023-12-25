import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { LoginWalletService } from '../services/login-wallet.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  data: any;
  constructor(private walletSvc: LoginWalletService) {}

  allowedFormats = [BarcodeFormat.QR_CODE]
  scannerEnabled = false;

  handle_refresh(event: any) {

  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
  }

  enable_scanner() {
    this.scannerEnabled = true;
  }

  disable_scanner() {
    this.scannerEnabled = false;
  }

  scanSuccess(event: any) {
    this.disable_scanner();
    this.data = event;
    // console.log(event);
  }

  scanError(event: any) {
    console.error(event);
  }
}
