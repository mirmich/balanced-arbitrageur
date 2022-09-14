import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, map, of } from 'rxjs';
import IconService from 'icon-sdk-js';

import {
  IPoolStatsReq,
  IPoolStats,
  IcxBalanceResult,
  TokensBalanceResult,
} from './pool-stats-req-params';

@Injectable({
  providedIn: 'root',
})
export class WalletProxyService {
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';
  trackerAddress: string =
    'https://main.tracker.solidwallet.io/v3/address/info?address=';

  handleEvent(eventType: string) {
    return fromEvent(window, 'ICONEX_RELAY_RESPONSE').pipe(
      map((e) => {
        if ((e as CustomEvent).detail.type == eventType) {
          return (e as CustomEvent).detail.payload;
        } else {
          return {};
        }
      })
    );
  }

  dispatchEvent(eventType: String) {
    const customEvent = new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: eventType,
      },
    });
    window.dispatchEvent(customEvent);
  }

  async getIcxBalance(address0: string): Promise<number> {
    const httpProvider = new IconService.HttpProvider(this.address);
    const iconService = new IconService(httpProvider);
    const balanceP = await iconService.getBalance(address0).execute();
    return balanceP.shiftedBy(-18).toNumber();
  }

  getTokens(address0: string) {
    return this.http.get<TokensBalanceResult>(
      `${this.trackerAddress}${address0}`
    );
  }
  /**
    const customEvent = new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_SIGNING',
        payload: {
          from: 'hx19870922...',
          hash: '0x13979...'
        }
      }
    });
    window.dispatchEvent(customEvent);

    const eventHandler = event => {
      const { type, payload } = detail
      if (type === 'RESPONSE_SIGNING') {
        console.log(payload) // e.g., 'q/dVc3qj4En0GN+...'
      }
      else if (type === 'CANCEL_SIGNING') {
        console.error('User cancelled signing request')
      }
    }
    window.addEventListener('ICONEX_RELAY_RESPONSE', eventHandler);
   */
}
