import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

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
