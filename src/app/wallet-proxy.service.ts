import { Injectable } from '@angular/core';
import { fromEvent, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WalletProxyService {
  constructor() {}

  handleEvent(eventType: string) {
    return fromEvent(window, 'ICONEX_RELAY_RESPONSE').pipe(
      map((e) => {
        console.log(e);
        if ((e as CustomEvent).detail.type == eventType) {
          return (e as CustomEvent).detail.payload;
        } else {
          return {};
        }
      })
    );
  }
}
