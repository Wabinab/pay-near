import { Component, OnInit } from '@angular/core';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
// import { setupLedger } from "@near-wallet-selector/ledger";
import { setupModal } from '@near-wallet-selector/modal-ui';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  selector: any = null;
  modalWallet: any;
  constructor() {}

  // const selector = 

  ngOnInit() {
    // await this.selector();
  }

  ionViewWillEnter() {
    setTimeout(() => this.setup(), 500);
  }

  async setup() {
    this.selector = await setupWalletSelector({
      network: "testnet",
      modules: [
        setupMyNearWallet(),
      ]
    });

    this.modalWallet = setupModal(this.selector, {
      contractId: 'guest-book.testnet'
    });
  }

  show_wallet() {
    if (this.modalWallet == undefined) this.setup();
    // console.log(this.modalWallet);
    // console.warn(this.selector);
    this.modalWallet.show();
  }

}
