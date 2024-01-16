import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginWalletService } from '../services/login-wallet.service';
import { utils } from 'near-api-js';
import { Swiper } from 'swiper/types';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  stats_activated: boolean = true;

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

    // console.warn(this.stats_activated);
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
  segments = ["spendings", "earnings"];
  curr_seg = this.segments[0];
  // on_seg_click(segment: string) {
  //   this.curr_seg = segment;
  // }

  // seg_index = 1;
  // swipe_event(event: any) {
  //   // Swipe left
  //   if (event.direction == 2) {
  //     this.seg_index -= 1;
  //   }

  //   // Swipe right
  //   if (event.direction == 4) {
  //     this.seg_index += 1;
  //   }

  //   // To prevent overswipe.
  //   if (this.seg_index > this.segments.length) {
  //     this.seg_index = this.segments.length;
  //   }
  //   if (this.seg_index < 0) {
  //     this.seg_index = 0;
  //   }

  //   this.curr_seg = this.segments[this.seg_index];
  // }

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  
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

}
