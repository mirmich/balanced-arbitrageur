import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, map, of } from 'rxjs';
import IconService from 'icon-sdk-js';

import { TokensBalanceResult } from '../model/tokens';

@Injectable({
  providedIn: 'root',
})
export class WalletProxyService {
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';
  private walletAddress = '';
  trackerAddress: string =
    'https://main.tracker.solidwallet.io/v3/address/info?address=';

  httpProvider = new IconService.HttpProvider(this.address);
  iconService = new IconService(this.httpProvider);

  getAddress() {
    if (this.walletAddress.length === 0) {
      return this.handleEvent('ICONEX_RELAY_RESPONSE', 'RESPONSE_ADDRESS').pipe(
        map((walletAddress0) => {
          this.walletAddress = walletAddress0;
          return walletAddress0;
        })
      );
    } else {
      return of(this.walletAddress);
    }
  }
  confirmation() {
    return this.handleEvent('ICONEX_RELAY_RESPONSE', 'RESPONSE_JSON-RPC');
  }
  canceled() {
    return this.handleEvent('ICONEX_RELAY_RESPONSE', 'CANCEL_JSON-RPC');
  }

  handleEvent(eventName: string, eventType: string) {
    return fromEvent(window, eventName).pipe(
      map((e) => {
        if ((e as CustomEvent).detail.type == eventType) {
          return (e as CustomEvent).detail.payload;
        } else {
          return {};
        }
      })
    );
  }

  dispatchEvent(eventName: string, eventType: String, payload0?: any) {
    let customEvent: Event;
    if (typeof payload0 !== undefined) {
      customEvent = new CustomEvent(eventName, {
        detail: {
          type: eventType,
          payload: payload0,
        },
      });
    } else {
      customEvent = new CustomEvent(eventName, {
        detail: {
          type: eventType,
        },
      });
    }

    window.dispatchEvent(customEvent);
  }

  async getIcxBalance(address0: string): Promise<number> {
    const balanceP = await this.iconService.getBalance(address0).execute();
    return balanceP.shiftedBy(-18).toNumber();
  }

  getTokens(address0: string) {
    return this.http.get<TokensBalanceResult>(
      `${this.trackerAddress}${address0}`
    );
  }
}
