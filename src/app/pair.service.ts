import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap, mergeMap } from 'rxjs/operators';
import { hexToDouble, isNotNullOrUndefined } from './utils/pair-utils';
import { Observable, throwError, Observer } from 'rxjs';
import { concat, forkJoin, merge } from 'rxjs';

import {
  IPoolStatsReqParams,
  IPoolStatsReq,
  IPoolStats,
  ITokenName,
} from './pool-stats-req-params';
import { ITokenAltName } from './names';

@Injectable({
  providedIn: 'root',
})
export class PairService {
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';

  getNames() {
    return this.http.get<ITokenAltName[]>('/assets/names.json');
  }

  getPoolStatsOut(poolId: string) {
    return this.http
      .post<IPoolStats>(this.address, this.getPoolStats(poolId))
      .pipe(
        catchError((error) => {
          return of({});
        })
      );
  }

  getPools(count: number) {
    // const observer: Observer<IPoolStats[]> = {
    //   next: (poolStats: IPoolStats[]) => {
    //     poolStats.forEach(async (poolStat) => {
    //       if (!_.isEmpty(poolStat)) {
    //         this.pools.push(this.smoothPoolResult(poolStat));
    //       }
    //     });
    //   },
    //   error: (err: string) => console.log(err),
    //   complete: () => this.tranformNames(),
    // };

    var indices: Array<number> = [];
    // Find all possible pools listed on Balanced
    for (let i = 1; i < count; i++) {
      indices.push(i);
    }

    const observables = indices.map((x) =>
      this.getPoolStatsOut('0x' + x.toString(16)).pipe(
        isNotNullOrUndefined(),
        mergeMap((pool) => {
          console.log(pool);
          return of(this.smoothPoolResult(pool as unknown as IPoolStats));
        })
      )
    );
    const pools = forkJoin(observables);
    return pools;
  }

  getTokenNameOut(tokenAddress: String) {
    return this.http
      .post<ITokenName>(this.address, this.getTokenName(tokenAddress))
      .pipe(
        catchError((error) => {
          return of({ jsonrpc: '', id: '', result: '' });
        })
      );
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

  private getTokenName(tokenAddress: String) {
    const params: IPoolStatsReqParams = {
      to: `${tokenAddress}`,
      dataType: 'call',
      data: {
        method: 'name',
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

  private smoothPoolResult(resultDirty: IPoolStats): IPoolStats {
    const decimalBase = parseInt(
      resultDirty.result.base_decimals.substring(2),
      16
    );
    const decimalQuote = parseInt(
      resultDirty.result.quote_decimals.substring(2),
      16
    );
    const decimal = Math.min(decimalBase, decimalQuote);
    const smoothed = hexToDouble(resultDirty.result.price, decimal).toString();
    let p1 = {
      ...resultDirty,
    };
    p1.result.price = smoothed;
    return p1;
  }
}
