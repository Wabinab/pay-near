import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-qrcode-modal',
  templateUrl: './qrcode-modal.component.html',
  styleUrls: ['./qrcode-modal.component.scss'],
})
export class QrcodeModalComponent  implements OnInit {
  qr_data: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  get width() {
    return Math.round(window.innerWidth * 0.95);
  }
}
