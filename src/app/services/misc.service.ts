import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  breakpoint = 35;

  constructor() { }

  mod_receipt(receipt: any) {
    if (receipt.from.length > this.breakpoint) receipt.from = this._alter_name(receipt.from);
    if (receipt.to.length > this.breakpoint) receipt.to = this._alter_name(receipt.to);
  }

  alter_name(name: string) {
    if (name.length > this.breakpoint) return this._alter_name(name);
    return name;
  }

  private _alter_name(name: string) {
    return name.slice(0, 4) + '...' + name.slice(name.length-4);
  }

  // ===============================================
  // pStart = { x: 0, y: 0 };
  // pStop = { x: 0, y: 0 };

  // swipeStart(e: any) {
  //   if (typeof e["targetTouches"] !== "undefined") {
  //     var touch = e.targetTouches[0];
  //     this.pStart.x = touch.screenX;
  //     this.pStart.y = touch.screenY;
  //   } else {
  //     this.pStart.x = e.screenX;
  //     this.pStart.y = e.screenY;
  //   }
  // }

  // swipeEnd(e: any) {
  //   if (typeof e["changedTouches"] !== "undefined") {
  //     var touch = e.changedTouches[0];
  //     this.pStop.x = touch.screenX;
  //     this.pStop.y = touch.screenY;
  //   } else {
  //     this.pStop.x = e.screenX;
  //     this.pStop.y = e.screenY;
  //   }

  //   this.swipeCheck();
  // }

  // swipeCheck() {
  //   var changeY = this.pStart.y - this.pStop.y;
  //   var changeX = this.pStart.x - this.pStop.x;
  //   if (this.isPullDown(changeY, changeX)) {
  //     alert("Swipe Down!");
  //   }
  // }

  // isPullDown(dY: any, dX: any) {
  //   // methods of checking slope, length, direction of line created by swipe action
  //   return (
  //     dY < 0 &&
  //     ((Math.abs(dX) <= 100 && Math.abs(dY) >= 300) ||
  //       (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
  //   );
  // }
}
