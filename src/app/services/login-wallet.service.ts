import { Injectable } from '@angular/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { AccountState, setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet"; 
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class LoginWalletService {

  selector: any = null;
  modalWallet: any;
  state: any;
  account_id: string | null = null;

  constructor(private toastSvc: ToastService) {
    setTimeout(() => this.setup(), 500);
  }

  async setup() {
    this.selector = await setupWalletSelector({
      network: "testnet",
      modules: [
        setupMyNearWallet(),
        setupLedger(),
        setupHereWallet(),
        setupNearFi(),
        setupNearMobileWallet()
      ]
    });

    this.modalWallet = setupModal(this.selector, {
      contractId: 'guest-book.testnet'
    });

    this.state = this.selector.store.getState();
    this.account_id = this.get_account_id();
  }

  show_wallet() {
    if (this.modalWallet == undefined) this.setup();
    // console.log(this.modalWallet);
    // console.warn(this.selector);
    this.modalWallet.show();
  }

  get_accounts(): Array<AccountState> {
    if (this.modalWallet == undefined) this.setup();
    return this.state.accounts;
  }

  get_account_id() {
    if (this.modalWallet == undefined) this.setup();
    return this.state.accounts.find((acc: any) => acc.active)?.accountId || null;
  }

  double_click: boolean = false;
  async logout() {
    if (!this.double_click) {
      this.toastSvc.present_toast("Click again to logout", 'middle');
      this.double_click = true;
      setTimeout(() => { this.double_click = false; }, 3000);
      return;
    }

    var wallet = await this.selector.wallet();
    wallet.signOut().catch((err: any) => {
      console.log("Failed to sign out");
      console.error(err);
      this.toastSvc.present_toast(`Failed to signout: ${err}`, "top", 'bg-danger');
      return;
    });
    
    // Clear all (except selector and modalWallet)
    this.state = null;
    this.account_id = null;

    this.toastSvc.present_toast("Logged out", 'middle', 'bg-success');
    this.double_click = false;
  }
}
