import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule, 
    QRCodeModule
  ],
  declarations: [Tab1Page],
  providers: [NFC, Ndef]
})
export class Tab1PageModule {}
