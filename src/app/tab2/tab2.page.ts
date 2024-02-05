import { Component, OnInit } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { LoginWalletService } from '../services/login-wallet.service';
import { utils } from 'near-api-js';
import { ToastService } from '../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  data: any;
  constructor(private walletSvc: LoginWalletService, private toastSvc: ToastService,
    private route: ActivatedRoute, private router: Router) {}

  allowedFormats = [BarcodeFormat.QR_CODE]
  scannerEnabled = false;

  async ngOnInit() {
    await this.load_txhash();
  }

  handle_refresh(event: any) {
    this.load_txhash();
    event.target.complete();
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

    this.receipt = await this.walletSvc.call('transfer', {
      target: splitted_value[0],
      amount: yocto_amt
    }, yocto_amt ?? "0");
    console.warn(this.receipt);
  }

  private async load_txhash() {
    const txhash = this.route.snapshot.queryParamMap.get('transactionHashes');
    console.log(txhash);
    if (txhash) {
      this.receipt = await this.walletSvc.getTxRes(txhash);
      console.warn(this.receipt);
    }
  }

  // Clear tx hash. 
  clear_txhash() {
    this.router.navigate([], { queryParams: { "transactionHashes": null }, 
      queryParamsHandling: 'merge'
    });
    this.receipt = null;
  }

  // ===============================================================
  doErr(err: string) {
    this.toastSvc.present_toast(err, "top", "bg-danger", 10000);
    console.error(err);
  }

  get buttons_class() {
    if (!this.scannerEnabled && !this.receipt) return "container-bottom";
    return "d-flex justify-content-center pt-3";
  }

  // get_wallet() {
  //   console.log(this.walletSvc.wallet);
  // }
}
