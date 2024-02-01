import { Component } from '@angular/core';
import { LoginWalletService } from '../services/login-wallet.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private walletSvc: LoginWalletService) {}

  show_wallet() {
    if (["", null, undefined].includes(this.walletSvc.account_id)) this.walletSvc.show_wallet();
    else this.walletSvc.logout();
  }

  // get wallet_name() {
  //   return this.walletSvc.get_account_id() || "Login";
  // }

  // wallet_name() {
  //   console.log(this.walletSvc.get_accounts())
  //   console.warn(this.walletSvc.get_account_id());
  // }

  get logout_login() {
    return this.walletSvc.account_id ? "Logout" : "Login";
  }

  get is_login() {
    return this.walletSvc.account_id ? false : true;
  }

  get double_click() {
    return this.walletSvc.double_click;
  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
  }

  // ===========================================================
  get net_name() {
    return this.walletSvc.network;
  }

  change_net() {
    return;
    // this.walletSvc.change_network();
  }
}
