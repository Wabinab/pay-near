import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { NgxEchartsModule } from 'ngx-echarts';

import { Tab3PageRoutingModule } from './tab3-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab3PageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
  ],
  declarations: [Tab3Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab3PageModule {}
