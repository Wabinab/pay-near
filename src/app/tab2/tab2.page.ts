import { Component } from '@angular/core';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';
import { ToastController } from '@ionic/angular';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private nfc: NFC, private ndef: Ndef, private toastCtrl: ToastController) {}

  scanned_result: any;
  content_visibility = "";
  ionViewWillLeave() {
    this.stop_scan();
  }

  // ===========================================================
  async check_permission() {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true })
      this.present_toast(`${JSON.stringify(status)}`, "bottom", "", 30000);
      if (status.granted) return true;
      if (status.neverAsked) {
        const c = confirm('We need your permission to use your camera to be able to scan barcodes');
        if (c) return true;
      }
      return false;
    } catch (e) {
      this.doErr(e);
    }
    return false;
  }

  async start_scan() {
    try {
      const permission = await this.check_permission();
      this.present_toast(`Permission: ${permission}`, "top");
      if (!permission) return;

      await BarcodeScanner.hideBackground();
      document.querySelector('body')?.classList.add('scanner-active');
      this.content_visibility = 'hidden';

      const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });
      
      await BarcodeScanner.showBackground();
      document.querySelector('body')?.classList.remove('scanner-active');
      this.content_visibility = '';

      if (result?.hasContent) {
        this.scanned_result = result.content;
      }
    } catch (err) {
      this.doErr(err);
      this.stop_scan();
    }
  }

  stop_scan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    this.content_visibility = '';
  }
  // ===========================================================

  share() {
    var message = [
      this.ndef.textRecord("hello, world")
    ];

    this.present_toast("Start sharing", "top", "bg-success");
    this.nfc.share(message).then(res => {
      this.present_toast(`Shared: ${res}`, "top", "bg-success");
    }, err => this.doErr(err));
  }

  unshare() {
    this.nfc.unshare().then(res => {
      this.present_toast("Unshared", "top", "bg-success");
    }, err => this.doErr(err));
  }

  refresh() {

  }
  async handle_refresh(event: any) {
    const finish = await this.refresh();
    event.target.complete();
  }

  // ===========================================================
  doErr(err: any) {
    console.error(err);
    this.present_toast(err, "bottom", "bg-danger", 3000);
  }

  async present_toast(message: string, position: any, 
    color: string | null = null,
    duration: number = 1500
  ) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position,
      cssClass: color != null ? `custom-${color}` : '',
      // cssClass: 'custom-bg-info',
      buttons: [
        {
          text: 'X',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });

    await toast.present();
  }
}
