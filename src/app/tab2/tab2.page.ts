import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { LoginWalletService } from '../services/login-wallet.service';
import { utils } from 'near-api-js';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  data: any;
  constructor(private walletSvc: LoginWalletService, private toastSvc: ToastService) {}

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
    this.transfer();  // or take away this.data and pass as args into transfer() instead.
    // console.log(event);
  }

  scanError(event: any) {
    console.error(event);
  }

  // ==================================================
  receipt: any = null;
  private async transfer() {
    var splitted_value = this.data.split(" ");
    var yocto_amt = utils.format.parseNearAmount(splitted_value[1]);

    if (splitted_value.length != 2) { this.doErr("splitted_value length != 2"); }
    if (splitted_value[0] == '') { this.doErr("Transfer account not specified."); }
    if (parseInt(splitted_value[1]) < 0.001) { this.doErr("Transfer value minimum is 0.001N."); }
    

    // if (this.walletSvc.contract == null) { this.walletSvc.setup_contract(); }
    // this.walletSvc.contract?.transfer(
    //   {
    //     target: splitted_value[0],
    //     amount: yocto_amt,
    //     date: new Date().toISOString()
    //   },
    //   "300000000000000", // attached GAS (optional),
    //   yocto_amt
    // ).then((res: any) => {
    //   console.warn(res);
    //   this.receipt = res;
    // }, (err: any) => console.error(err));

    const result = await this.walletSvc.call('transfer', {
      target: splitted_value[0],
      amount: yocto_amt,
      date: new Date().toISOString()
    }, yocto_amt ?? "0");
    console.warn(result);
  }

  doErr(err: string) {
    this.toastSvc.present_toast(err, "top", "bg-danger", 10000);
    console.error(err);
  }

  get_wallet() {
    console.log(this.walletSvc.wallet);
  }
}
