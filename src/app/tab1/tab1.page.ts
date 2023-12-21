import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  barcode: any;
  constructor() {}

  async request_permission() {
    const { camera } = await BarcodeScanner.requestPermissions();
    console.log(`Request Permission: ${camera}`);
  }

  async scan_single() {
    document.querySelector('body')?.classList.add('barcode-scanner-active');

    const listener = await BarcodeScanner.addListener(
      'barcodeScanned',
      async result => {
        await listener.remove();
        document.querySelector('body')?.classList.remove('barcode-scanner-active');
        await BarcodeScanner.stopScan();
        this.barcode = result.barcode;
      }
    );

    await BarcodeScanner.startScan();
  }

  async install_gbs() {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  async check_permission() {
    const { camera } = await BarcodeScanner.checkPermissions();
    console.log(camera);
  }

  async start_scan() {
    await this.request_permission();
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const listener = await BarcodeScanner.addListener(
      "barcodeScanned",
      async (result) => { this.barcode = result.barcode; }
    );

    await BarcodeScanner.startScan();
  }

  async stop_scan() {
    document.querySelector("body")?.classList.remove('barcode-scanner-active');
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  }
}
