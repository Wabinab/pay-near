import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginWalletService } from '../services/login-wallet.service';
import { utils } from 'near-api-js';
import { Swiper } from 'swiper/types';
import type { EChartsOption } from 'echarts';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  stats_activated: boolean = true;
  spend_stats: any;
  earn_stats: any;

  month_unit: string;
  year_unit: string = "";

  constructor(private walletSvc: LoginWalletService, private titlePipe: TitleCasePipe) {}

  ngOnInit() {
    this.month_unit = "";
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
      console.log(this.spend_stats);
      console.warn(this.earn_stats);

      this.draw_charts();
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
    this.draw_charts();
  }

  _segment_sel(index: number) {
    if (!this.swiper) { this.swiper_ready(); }
    this.swiper?.slideTo(index)
    // this.draw_charts();  // will call swiper_slided automatically when this swipe. 
  }

  // ==============================================
  // Charts
  month_option: EChartsOption;
  year_option: EChartsOption;
  test_x = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  test_y = [1.5, 3, 4.5, 2.8, 10.7, 12.3, 6.2, 8.5, 1.2, 0.6, 12.3, 5.7];

  draw_charts() {
    if (this.curr_seg == this.segments[0]) this._internal_draw_chart(this.spend_stats);
    if (this.curr_seg == this.segments[1]) this._internal_draw_chart(this.earn_stats);
  }

  _internal_draw_chart(data: any) {
    // Must be converted first, otherwise month_unit don't update. 
    const month_data = this._convert_values(this.test_y.map(c => c * 2500318.24), "month");
    this.month_option = {
      title: { text: this.titlePipe.transform(`${this.curr_seg} by months in `) + `${this.month_unit}N`, 
        textAlign: "center", left: '50%' 
      },
      tooltip: {},
      xAxis: { 
        name: "Month Year",
        // data: this._monthbin_alterer(data['bins_months']),
        data: this.test_x,
        nameLocation: 'middle',
        nameTextStyle: { padding: [10, 0, 0, 0] }
      },
      yAxis: { 
        name: `Total ${this._paid_earn(this.curr_seg)} (${this.month_unit}N)`,
        // nameLocation: 'middle',
        nameTextStyle: { padding: [0, 0, 0, 50] },
      },
      series: [{
        name: this.curr_seg,
        type: 'bar',
        label: { show: true, position: "top", rotate: 90, align: 'left', verticalAlign: 'middle' },
        // data: data['values_months']
        data: month_data
      }],
      // dataZoom: [{
      //   type: 'slider',
      //   start: 0,
      //   end: 5
      // }]
    };

    const year_data = this._convert_values(data['values_years'], "year");
    this.year_option = {
      title: { text: this.titlePipe.transform(`${this.curr_seg} by years in `) + `${this.year_unit}N`, 
        textAlign: "center", left: '50%' 
      },
      tooltip: {},
      xAxis: { 
        name: "Year", 
        data: data['bins_years'],
        nameLocation: 'middle',
        nameTextStyle: { padding: [10, 0, 0, 0] }
      },
      yAxis: {
        name: `Total ${this._paid_earn(this.curr_seg)} (${this.year_unit}N)`,
        // nameLocation: 'middle',
        nameTextStyle: { padding: [0, 0, 0, 50] },
      },
      series: [{
        name: this.curr_seg,
        type: 'bar',
        color: '#b35fbe',
        data: year_data
      }],
    };
  }

  _monthbin_alterer(bins_months: any[]) {
    return bins_months.map(c => {
      let ym = c.split(" ");
      return `${ym[1].padStart(2, '0')}/${ym[0]}`;
    });
  }

  _paid_earn(seg: string) {
    if (seg == this.segments[0]) return "Paid";
    return "Earn";
  }

  // convert unit based on median non-zero values
  _convert_values(values: any[], type: "month" | "year") {
    const median = this._find_median(values.map(c => parseFloat(c)));
    if (median > 1_000_000_000) {
      this._set_units(type, "B");
      return values.map(c => Math.round(parseFloat(c) / 1_000_000_000))
    }
    if (median > 1_000_000) {
      this._set_units(type, "M");
      return values.map(c => Math.round(parseFloat(c) / 1_000_000));
    }
    if (median > 1000) {
      this._set_units(type, "k");
      return values.map(c => Math.round(parseFloat(c) / 1000));
    }
    this._set_units(type, "");
    return values;
  }

  _set_units(type: "month" | "year", unit_type: string) {
    if (type == "month") this.month_unit = unit_type;
    else this.year_unit = unit_type;
  }

  _find_median(arr: number[]) {
    const mid = Math.floor(arr.length / 2);
    const values = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  }
}
