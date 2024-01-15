import { AfterViewInit, Component, OnInit } from '@angular/core';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
// import { setupLedger } from "@near-wallet-selector/ledger";
import { setupModal } from '@near-wallet-selector/modal-ui';
import { LoginWalletService } from '../services/login-wallet.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  stats_activated: boolean = true;

  constructor(private walletSvc: LoginWalletService) {}

  ngOnInit() {
    setTimeout(() => this.refresh_actions(), 1000);
  }

  async handle_refresh(event: any) {
    await this.refresh_actions();

    event.target.complete();
  }

  async refresh_actions() {
    this.stats_activated = await this.walletSvc.view('stats_activated', {
      "account": this.account_id
    });

    console.warn(this.stats_activated);
  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
  }

}
