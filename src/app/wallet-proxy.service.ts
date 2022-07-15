import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  IPoolStatsReq,
  IPoolStats,
  IcxBalanceResult,
} from './pool-stats-req-params';

@Injectable({
  providedIn: 'root',
})
export class WalletProxyService {
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';

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

  private getIcxBalance(address0: string) {
    return this.http
      .post<IcxBalanceResult>(this.address, this.getIcxBalanceReq(address0))
      .pipe(
        catchError((error) => {
          console.log(`Error when asking ICX balance: ${address0}`);
          return of({} as IcxBalanceResult);
        })
      );
  }

  private getIcxBalanceReq(address0: string) {
    const params = {
      address: address0,
    };
    const req: IPoolStatsReq = {
      jsonrpc: '2.0',
      id: 1657902889608,
      method: 'icx_getBalance',
      params: params,
    };
    return req;
  }
}
