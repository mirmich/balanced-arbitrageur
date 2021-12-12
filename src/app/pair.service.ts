import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { IAssetBalance, IPairReq } from './pair-req';
import { IPairReqParams } from './pair-req-params';
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

  //   private createReqPayload(method: string, poolId: string, token: string) {
  //     const params: IPairReqParams = {
  //       to: 'cxa0af3165c08318e988cb30993b3048335b94af6c',
  //       dataType: 'call',
  //       data: {
  //         method: `${method}`,
  //         params: {
  //           _id: `${poolId}`,
  //           _token: `${token}`,
  //         },
  //       },
  //     };
  //     const req: IPairReq = {
  //       jsonrpc: '2.0',
  //       id: 1631894860562,
  //       method: 'icx_call',
  //       params: params,
  //     };
  //     return req;
  //   }
}
