import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginWalletService } from '../services/login-wallet.service';
import { Vibration } from '@ionic-native/vibration/ngx';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  
  myForm: any;
  qr_finalized: boolean = false;

  constructor(private fb: FormBuilder, private walletSvc: LoginWalletService,
    private vibration: Vibration) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      qr_data: [0, [Validators.required, Validators.min(0.00001), 
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
    if (err['min']) return "Must be larger than 0."
    return null;
  }

  get errors() {
    return this.myForm.get('qr_data').errors;
  }

  lock_or_unlock() {
    if (this.myForm.get('qr_data').errors) return null;
    if (this.qr_finalized) return this.unlock_price();
    return this.lock_price();
  }

  get lock_unlock_name(): string {
    if (this.qr_finalized) return "Unlock";
    else return "Lock"
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
