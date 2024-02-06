import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor() { }

  mod_receipt(receipt: any) {
    if (receipt.from.length > 35) receipt.from = this._alter_name(receipt.from);
    if (receipt.to.length > 35) receipt.to = this._alter_name(receipt.to);
  }

  _alter_name(name: string) {
    return name.slice(0, 4) + '...' + name.slice(name.length-4);
  }
}
