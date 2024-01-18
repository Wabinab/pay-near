import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginWalletService } from '../services/login-wallet.service';
import { Vibration } from '@ionic-native/vibration/ngx';
import { ToastService } from '../services/toast.service';
import { utils } from 'near-api-js';
import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  
  myForm: any;
  qr_finalized: boolean = false;
  min_val = 0.001;
  max_val = 50_000_000;
  single_interval = 1_500;

  receipt_activated: boolean = true;  // button not display initially. 

  constructor(private fb: FormBuilder, private walletSvc: LoginWalletService,
    private vibration: Vibration, private toastSvc: ToastService) {}

  ngOnInit() {
    this.myForm = this.fb.group({
      qr_data: [, [Validators.required, Validators.min(this.min_val), 
        Validators.max(this.max_val),
        Validators.pattern("^[0-9]+(.[0-9]{0,5})?$")]]
    });
    this.source = interval(this.single_interval);
    setTimeout(() => this.refresh_fn(), 1000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async handle_refresh(event: any) {
    await this.refresh_fn(); 

    event.target.complete();
  }

  async refresh_fn() {
    this.receipt_activated = await this.walletSvc.view('receipt_activated', {
      "account": this.walletSvc.account_id
    });
    // console.warn(this.receipt_activated);
  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
  }

  get contract_id() {
    return this.walletSvc.contract_id;
  }

  get qr_data() {
    return `${this.account_id} ${this.myForm.get('qr_data')!.value.toString()}`;
  }

  get qr_error() {
    var err = this.myForm.get('qr_data').errors ?? {};
    if (err['pattern']) return "Max 5 decimal place, numbers only."
    if (err['min']) return `Minimum ${this.min_val} per transaction.`
    if (err['max']) return `Maximum ${this.max_val} per transaction.`;
    return null;
  }

  get errors() {
    return this.myForm.get('qr_data').errors;
  }

  lock_or_unlock() {
    if (this.errors) {
      this.myForm.get('qr_data').markAsDirty();
      if (this.errors['required']) this.toastSvc.present_toast(`Please input price`, "top", "bg-danger");
      else this.toastSvc.present_toast(`Error: ${this.qr_error}`, "top", "bg-danger");
      return null;
    }
    if (this.qr_finalized) return this.unlock_price();
    return this.lock_price();
  }

  get lock_unlock_name(): string {
    // if (this.qr_finalized) return "Unlock";
    // else return "Lock"
    if (this.qr_finalized) return "lock-open-outline";
    return "lock-closed-outline";
  }

  get lock_color(): string {
    if (this.qr_finalized) return "medium";
    return "primary";
  }

  lock_price() {
    this.qr_finalized = true;
    this.myForm.get('qr_data').disable();

    if (this.is_single) {
      this.receipt_updated = false;
      this.detect_receipt();
      this.set_old_receipt();
    }
  }

  unlock_price() {
    // Vibrate 0.3s, Pause 0.5s, Vibrate 0.8s. 
    this.vibration.vibrate([300, 500, 800]);
    this.qr_finalized = false;
    this.myForm.get('qr_data').enable();
    
    if (this.is_single) {
      this.stop_detect_receipt();
    }
  }

  // =====================================================
  activate_receipt() {
    this.walletSvc.call('activate_receipt', {}, utils.format.parseNearAmount("0.1") ?? "0")
  }

  // ======================================================
  // If is_single, will only accept single payment before page changed to display
  // receipt once it detected. If not, it'll allow multiple payments and NEVER change
  // receipt. 
  is_single: boolean = true;  
  old_receipt: any;
  receipt_updated: boolean = false;
  timeout_count = 0;
  threshold_timeout = Math.round(300_000 / 1_500);

  get is_single_name() {
    return this.is_single ? "Only one payment" : "Accept multiple payments";
  }

  on_single_change() {
    this.is_single = !this.is_single;
  }

  source: any;
  subscription: Subscription;
  detect_receipt() {
    this.subscription = this.source.subscribe((_: any) => this._receipt_changed());
  }

  stop_detect_receipt() {
    this.old_receipt = null;
    this.receipt_updated = false;
    this.timeout_count = 0;
    this.subscription.unsubscribe();
  }

  async _receipt_changed() {
    // console.log("receipt change called");
    if (this.account_id === "") {
      this.toastSvc.present_toast(
        "wallet account_id is invalid. Please login and wait 3 seconds.", "top", "bg-danger"
      );
      this.stop_detect_receipt();
      return;
    }
    let new_receipt = await this.walletSvc.view('latest_transaction', {
      "account": this.account_id
    });

    // console.log(this.compare_receipt(this.old_receipt, new_receipt));
    if (!this.compare_receipt(this.old_receipt, new_receipt)) {
      this.receipt_updated = true;
      this.stop_detect_receipt();
    }

    this.timeout_count += 1;
    if (this.timeout_count > this.threshold_timeout) { this.reset_if_no_pay(); }
  }

  compare_receipt(_old: any, _new: any) {
    return _old.from == _new.from
      && _old.to == _new.to
      && _old.total == _new.total
      && _old.charges == _new.charges
      && _old.final_total == _new.final_total;
      // Will include time later. 
  };

  async set_old_receipt() {
    if (this.account_id === "") {
      this.toastSvc.present_toast(
        "wallet account_id is invalid. Please login and wait 3 seconds.", "top", "bg-danger"
      );
      return;
    }
    this.old_receipt = await this.walletSvc.view('latest_transaction', {
      "account": this.account_id
    });
  }

  // reset if no pay within 5 minutes.
  reset_if_no_pay() {
    this.stop_detect_receipt();
  }
}
