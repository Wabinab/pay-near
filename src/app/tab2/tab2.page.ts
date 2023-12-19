import { Component } from '@angular/core';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(private nfc: NFC, private ndef: Ndef, private toastCtrl: ToastController) {}

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
