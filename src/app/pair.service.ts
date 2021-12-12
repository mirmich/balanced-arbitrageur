import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
import { Observable, throwError, Observer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { IAssetBalance, IPairReq } from './pair-req';
import { IPairReqParams } from './pair-req-params';
import { merge, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  IPoolStatsReqParams,
  IPoolStatsReq,
  IPoolStats,
} from './pool-stats-req-params';

@Injectable({
  providedIn: 'root',
})
export class PairService {
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';

  getPrices() {
    return this.http.get<PairPrice[]>('/assets/prices.json');
  }

  getPoolStatsOut(poolId: string) {
    return this.http.post<IPoolStats>(this.address, this.getPoolStats(poolId));
  }

  private getPoolStats(poolId: string) {
    const params: IPoolStatsReqParams = {
      to: 'cxa0af3165c08318e988cb30993b3048335b94af6c',
      dataType: 'call',
      data: {
        method: 'getPoolStats',
        params: {
          _id: `${poolId}`,
        },
      },
    };
    const req: IPoolStatsReq = {
      jsonrpc: '2.0',
      id: 1631894860562,
      method: 'icx_call',
      params: params,
    };
    return req;
  }

  private hexToDouble(numberInHex: string) {
    return parseInt(numberInHex.substring(2), 16) / 1000000000000000000;
  }

  public init() {
    const observer: Observer<Observable<IPoolStats>> = {
      next: (x: Observable<IPoolStats>) =>
        console.log('Observer got a next value: ' + x),
      error: (err: string) => console.error('Observer got an error: ' + err),
      complete: () => console.log('Observer got a complete notification'),
    };
    let poolsObservableArray: Array<Observable<IPoolStats>>;
    for (let i = 1; i < 100; i++) {
      poolsObservableArray.push(this.getPoolStatsOut('0x' + i.toString(16)));
    }
    const merged = merge(poolsObservableArray, 2);
    merged.subscribe(observer);
  }
}
