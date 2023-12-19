import { ChangeDetectorRef, Component } from '@angular/core';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  tag_id: string = '';
  tag_info: any;
  readerMode$: any;
  discoveredListenerSub$: any;

  constructor(private nfc: NFC, private ndef: Ndef, private cd: ChangeDetectorRef,
    private toastCtrl: ToastController) {}

  // test_as_sharer() {
  //   var message = [
  //     this.ndef.textRecord("hello, world")
  //   ];
  //   this.nfc.share(message).then(res => {
  //     console.log(res);
  //   }, err => this.doErr(err));
  // }

  ionViewWillEnter() {
    this.refresh();
  }
  ionViewWillLeave() {
    this.readerMode$.unsubscribe();
    this.discoveredListenerSub$.unsubscribe();
  }

  refresh() {
    this.start_nfc_listener();
    this.start_nfc_reader_mode();

    this.cd.detectChanges();
  }
  async handle_refresh(event: any) {
    const finish = await this.refresh();
    event.target.complete();
  }

  // =================================================================
  // NFC functions
  start_nfc_reader_mode() {
    let flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V;
    this.readerMode$ = this.nfc.readerMode(flags).subscribe(
      tag => {
        this.tag_info = tag;
        this.tag_id = this.nfc.bytesToHexString(this.tag_info.id.reverse());
        this.present_toast(`NFC detected: Tag ID:: ${this.tag_id}`, "top", "bg-success");
      }, err => {
        this.present_toast(`Failed to start NFC reader mode, error: ${err}`, "top", "bg-danger");
      }
    )
  }

  start_nfc_listener() {
    this.discoveredListenerSub$ = this.nfc.addTagDiscoveredListener(() => {
      
    }, (err: any) => {
      this.present_toast(`Error attaching tag discovered listener: ${err}`, "bottom", 'bg-danger');
    }).subscribe(event => {
      this.present_toast(`Received tag discovered listener mesage: ${event.tag}`, "bottom");
      const tag = this.nfc.bytesToHexString(event.target.id);
      this.present_toast(`Decoded tag: ${tag}`, "bottom");
      this.tag_info = event;
    })
  }

  // =================================================================
  doErr(err: any) {
    console.error(err);
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
