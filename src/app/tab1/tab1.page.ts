import { Component } from '@angular/core';
import { NFC, NFCOriginal, Ndef, NdefOriginal } from '@awesome-cordova-plugins/nfc';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private nfc: NFCOriginal, private ndef: NdefOriginal) {}

  test() {
    var message = [
      this.ndef.textRecord("hello, world")
    ];
    this.nfc.share(message).then(res => {
      console.log(res);
    }, err => this.doErr(err));
  }

  doErr(err: any) {
    console.error(err);
  }
}
