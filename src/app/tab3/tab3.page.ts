import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginWalletService } from '../services/login-wallet.service';
import { utils } from 'near-api-js';
import { Swiper } from 'swiper/types';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  stats_activated: boolean = true;
  spend_stats: any;
  earn_stats: any;

  constructor(private walletSvc: LoginWalletService) {}

  ngOnInit() {
    setTimeout(() => this.refresh_actions(), 1000);
  }

  async handle_refresh(event: any) {
    await this.refresh_actions();

    event.target.complete();
  }

  async refresh_actions() {
    this.stats_activated = await this.walletSvc.view('stats_activated', {
      "account": this.account_id
    });

    if (this.stats_activated) {
      this.spend_stats = await this.walletSvc.view('get_spendings', {
        "account": this.account_id
      });
      this.earn_stats = await this.walletSvc.view('get_earnings', {
        "account": this.account_id
      });

      this.draw_spend_charts();
    }
  }

  get account_id() {
    return this.walletSvc.account_id ?? "";
  }



  // ================================================
  activate_stats() {
    this.walletSvc.call("activate_statistics", {}, 
      utils.format.parseNearAmount("0.75") ?? "0"
    );
  }

  // =================================================
  // Segments
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  segments = ["spendings", "earnings"];
  curr_seg = this.segments[0];
  
  swiper_ready() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  swiper_slided(event: any) {
    const index = event.target.swiper.activeIndex;
    this.curr_seg = this.segments[index];
  }

  _segment_sel(index: number) {
    if (!this.swiper) { this.swiper_ready(); }
    this.swiper?.slideTo(index)
  }

  // ==============================================
  // Charts
  month_option: EChartsOption;
  test_x = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  test_y = [1.5, 3, 4.5, 2.8, 10.7, 12.3, 6.2, 8.5, 1.2, 0.6, 12.3, 5.7];

  draw_spend_charts() {
    this.month_option = {
      title: { text: "Spendings By Months", textAlign: "center", left: '50%' },
      tooltip: {},
      xAxis: { name: "Month Year",
      //  data: this._monthbin_alterer(this.spend_stats['bins_months']) 
        data: this.test_x,
        nameLocation: 'middle',
        nameTextStyle: { padding: [10, 0, 0, 0] }
      },
      yAxis: { 
        name: 'Total Paid (NEAR)',
        nameLocation: 'middle',
        // nameRotate: "90",
        nameTextStyle: { padding: [0, 0, 5, 0] },
      },
      series: [{
        name: 'spendings',
        type: 'bar',
        // data: this.spend_stats['values_months']
        data: this.test_y
      }],
      // dataZoom: [{
      //   type: 'slider',
      //   start: 0,
      //   end: 5
      // }]
    }
  }

  _monthbin_alterer(bins_months: any[]) {
    return bins_months.map(c => {
      var ym = c.split(" ");
      return `${ym[1].padStart(2, '0')}/${ym[0]}`;
    });
  }
}
