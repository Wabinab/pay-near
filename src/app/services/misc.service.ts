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
}
