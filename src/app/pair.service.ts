import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
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
  // {"jsonrpc":"2.0","method":"icx_call","params":{"from":"hx23ada4a4b444acf8706a6f50bbc9149be1781e13","to":"cxf61cd5a45dc9f91c15aa65831a30a90d59a09619","dataType":"call","data":{"method":"name"}},"id":344522255}

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
}
