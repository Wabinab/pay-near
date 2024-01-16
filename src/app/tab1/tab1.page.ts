import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginWalletService } from '../services/login-wallet.service';
import { Vibration } from '@ionic-native/vibration/ngx';
import { ToastService } from '../services/toast.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  
  myForm: any;
  qr_finalized: boolean = false;
  min_val = 0.001;
  max_val = 50_000_000;

  constructor(private fb: FormBuilder, private walletSvc: LoginWalletService,
    private vibration: Vibration, private toastSvc: ToastService) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      qr_data: [, [Validators.required, Validators.min(this.min_val), 
        Validators.max(this.max_val),
        Validators.pattern("^[0-9]+(.[0-9]{0,5})?$")]]
    });
    // this.myForm.get('qr_data').valueChanges.pipe(
    //   map((val) => (console.log(this.myForm.get('qr_data').errors)))
    // ).subscribe();
  }

  handle_refresh(event: any) {
    event.target.complete();
  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
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
      if (this.errors['required']) this.toastSvc.present_toast(`No price`, "top", "bg-danger");
      else this.toastSvc.present_toast(`Error: ${this.qr_error}`, "top", "bg-danger");
      return null;
    }
    if (this.qr_finalized) return this.unlock_price();
    return this.lock_price();
  }

  get lock_unlock_name(): string {
    if (this.qr_finalized) return "Unlock";
    else return "Lock"
  }

  get lock_color(): string {
    if (this.qr_finalized) return "medium";
    else return "primary"
  }

  lock_price() {
    this.qr_finalized = true;
    this.myForm.get('qr_data').disable();
  }

  unlock_price() {
    // Vibrate 0.3s, Pause 0.5s, Vibrate 0.8s. 
    this.vibration.vibrate([300, 500, 800]);
    this.qr_finalized = false;
    this.myForm.get('qr_data').enable();
  }
}
