import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { Vibration } from '@ionic-native/vibration/ngx';
import { QrcodeModalComponent } from './qrcode-modal/qrcode-modal.component';
import { Brightness } from '@ionic-native/brightness/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    QRCodeModule,
  ],
  declarations: [Tab1Page, QrcodeModalComponent],
  providers: [Vibration, Brightness]
})
export class Tab1PageModule {}
