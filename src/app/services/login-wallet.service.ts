import { Injectable } from '@angular/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { AccountState, Network, NetworkId, setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
// import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { ToastService } from './toast.service';
import { Contract, providers } from 'near-api-js';

@Injectable({
  providedIn: 'root'
})
export class LoginWalletService {

  network: Network | NetworkId = 'mainnet';

  selector: any = null;
  modalWallet: any;
  state: any;
  account_id: string | null = null;
  wallet: any;
  contract_id_mainnet: string = 'pay_near.near';
  contract_id_testnet: string = 'pay_testnet.testnet';
  // contract: any | null = null;

  constructor(private toastSvc: ToastService) {
    setTimeout(() => this.setup(), 500);
  }

  setup_contract() {
    // console.warn(this.state.accounts.find((acc: any) => acc.active));
    if (!this.state.accounts.find((acc: any) => acc.active)) {
      this.toastSvc.present_toast("No active account, cannot setup.", "top", "bg-danger", 5000);
      return;
    }
    // this.contract = new Contract(this.state.accounts.find((acc: any) => acc.active), this.contract_id, {
    //   viewMethods: [],
    //   changeMethods: ["transfer"]
    // });
  }

  get contract_id() {
    return this.network == 'mainnet' ? this.contract_id_mainnet : this.contract_id_testnet;
  }

  async setup() {
    this.selector = await setupWalletSelector({
      network: 'mainnet',
      modules: [
        setupMyNearWallet(),
        setupLedger(),
        // setupHereWallet(),  // this will be separate, which we'll solve soon. 
      ]
    });
    // if (this.network == 'mainnet') {
    //   this.selector.options.network = {networkId: 'mainnet', nodeUrl: 'https://rpc.mainnet.near.org', helperUrl: 'https://helper.mainnet.near.org', explorerUrl: 'https://nearblocks.io', indexerUrl: 'https://api.kitwallet.app'};
    // } else {
    //   this.selector.options.network = {networkId: 'testnet', nodeUrl: 'https://rpc.testnet.near.org', helperUrl: 'https://helper.testnet.near.org', explorerUrl: 'https://testnet.nearblocks.io', indexerUrl: 'https://testnet-api.kitwallet.app'};
    // }
    // console.log(this.selector);
    // console.log(this.contract_id)

    this.modalWallet = setupModal(this.selector, {
      contractId: this.contract_id
    });

    if (this.selector.isSignedIn()) {
      this.state = this.selector.store.getState();
      this.get_account_id();
      // this.account_id = this.get_account_id();
  
      this.wallet = await this.selector.wallet();
      this.setup_contract();
    }
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
    this.account_id = this.state.accounts.find((acc: any) => acc.active)?.accountId || null;
    return this.account_id;
  }

  double_click: boolean = false;
  async logout() {
    if (!this.double_click) {
      this.toastSvc.present_toast("Click logout again", 'middle');
      this.double_click = true;
      setTimeout(() => { this.double_click = false; }, 3000);
      return;
    }

    if (!this.selector.isSignedIn()) {
      this.toastSvc.present_toast("Already logout. Please restart app.", "top", "bg-danger", 3000);
    }
    
    var wallet = await this.selector.wallet();
    if (wallet == null) 
    wallet.signOut().catch((err: any) => {
      console.log("Failed to sign out");
      console.error(err);
      this.toastSvc.present_toast(`Failed to signout: ${err}`, "top", 'bg-danger', 5000);
      return;
    });

    
    // Clear all (except selector and modalWallet)
    this.state = null;
    this.account_id = null;
    this.wallet = null;
    // this.contract = null;

    // this.toastSvc.present_toast("Logged out", 'middle', 'bg-success');
    this.double_click = false;

    // For github pages
    if ((window as any).localStorage['near_app_wallet_auth_key'] != undefined) {
      this.toastSvc.present_toast("Logged out. Reloading page in 3 seconds.", 'middle', 'bg-success', 3000);
      (window as any).localStorage['near_app_wallet_auth_key'] = '{}';
      setTimeout(() => (window as any).location.reload(), 3000);
    } else {
      this.toastSvc.present_toast("Logged out", 'middle', 'bg-success');
    }
  }

  // =================================
  async call(method: string, args = {}, deposit = "0") {
    const gas = '30000000000000';
    const outcome = await this.wallet.signAndSendTransaction({
      signerId: this.account_id,
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

  async view(method: string, args = {}) {
    if (this.selector == null) await this.setup();
    const { network } = this.selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    let res: any = await provider.query({
      request_type: 'call_function',
      account_id: this.contract_id,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });

    return await JSON.parse(Buffer.from(res.result).toString());
  }

  async getTxRes(txhash: string) {
    if (this.selector == null) await this.setup();
    const { network } = this.selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  }

  // ==================================================================
  async change_network() {
    if (this.selector.isSignedIn()) {
      this.double_click = true;
      await this.logout();
    }

    if (this.network == 'mainnet') this.network = 'testnet';
    else this.network = 'mainnet';

    this.selector = null;
    this.state = null;
    this.account_id = null;
    this.wallet = null;
    this.modalWallet = null;
    await this.setup();
  }
}
