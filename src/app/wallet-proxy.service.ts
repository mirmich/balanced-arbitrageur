import { Injectable } from '@angular/core';
import { fromEvent, map } from 'rxjs';

@Injectable()
export class WalletProxyService {
  constructor() {}

  handleEvent(eventType: string) {
    return fromEvent(window, 'ICONEX_RELAY_RESPONSE').pipe(
      map((e) => {
        if (e.type == eventType) {
          return (e as CustomEvent).detail.payload;
        } else {
          return {};
        }
      })
    );
  }
}
