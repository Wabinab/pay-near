import { Component, OnInit } from '@angular/core';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor() {}

  async ngOnInit() {
    const selector = await setupWalletSelector({
      network: "testnet",
      modules: [
        setupMyNearWallet(),
        setupLedger()
      ],
    });
  }

}
