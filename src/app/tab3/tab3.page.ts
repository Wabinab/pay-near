import { Component, OnInit } from '@angular/core';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
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

  async ngOnInit() {
    await this.setup().catch(err => {
      console.error(err);
    });
  }

  async setup() {
    await setupWalletSelector({
      network: "testnet",
      modules: [
        // setupMyNearWallet(),
        // setupLedger()
      ]
    });
  }

  show_wallet() {
    // setupWalletSelector({
    //   network: "testnet",
    //   modules: [
    //     setupMyNearWallet(),
    //     setupLedger()
    //   ],
    // }).then(selector => {
    //   this.modalWallet = setupModal(selector, {
    //     contractId: 'guest-book.testnet'
    //   });
    //   this.modalWallet.show();
    // })
    // this.modalWallet.show();
  }

}
