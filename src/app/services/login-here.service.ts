import { Injectable } from '@angular/core';
import { HereWallet } from "@here-wallet/core";
import { ToastService } from './toast.service';
import { providers } from 'near-api-js';

@Injectable({
  providedIn: 'root'
})
export class LoginHereService {

  wallet: any = null;
  account: any = null;

  network: string = 'mainnet';
  contract_id_mainnet: string = 'pay_near.near';
  contract_id_testnet: string = 'pay_testnet.testnet';

  constructor(private toastSvc: ToastService) { 
    this.wallet = new HereWallet();
  }

  get contract_id() {
    return this.network == 'mainnet' ? this.contract_id_mainnet : this.contract_id_testnet;
  }

  async login() {
    if (this.wallet == null) this.wallet = new HereWallet();
    this.account = await this.wallet.signIn({ contractId: this.contract_id });
    this.toastSvc.present_toast(`Hello: ${this.account}!`, "top", "bg-success");
  }

  get_account_id() {
    this.wallet.getAccountId();
  }

  double_click: boolean = false;
  async logout() {
    if (!this.double_click) {
      this.toastSvc.present_toast("Click logout again", 'middle');
      this.double_click = true;
      setTimeout(() => { this.double_click = false; }, 3000);
      return;
    }

    if (this.wallet == null) { 
      this.toastSvc.present_toast("Wallet fail to initialize. Please report to github with details.", "top", "bg-danger", 3000);
    }

    if (!this.wallet.isSignedIn()) {
      this.toastSvc.present_toast("Already logout. Please restart app.", "top", "bg-danger", 3000);
    }

    this.wallet.signOut().catch((err: any) => {
      console.log("Failed to sign out");
      console.error(err);
      this.toastSvc.present_toast(`Failed to signout: ${err}`, "top", 'bg-danger', 5000);
      return;
    });

    this.wallet = new HereWallet();
    this.account = null;
    this.double_click = false;

    // We're not using it for github pages. 
  }

  // ===============================================
  async call(method: string, args = {}, deposit = "0") {
    if (this.get_account_id() == null) {
      this.toastSvc.present_toast("Please sign in.", "middle", "bg-danger", 3000);
      return;
    }
    const gas = '30000000000000';
    const outcome = await this.wallet.signAndSendTransaction({
      signerId: this.get_account_id(),
      receiverId: this.contract_id,
      actions: [{
        type: 'FunctionCall',
        params: {
          methodName: method,
          args,
          gas,
          deposit
        },
      }]
    });

    return providers.getTransactionLastResult(outcome);
  }
}
