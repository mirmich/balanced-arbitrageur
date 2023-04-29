import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { isEmpty, priceImpact } from '../utils/pair-utils';
import { Observable, timer } from 'rxjs';
import { zip } from 'rxjs';
import IconService from 'icon-sdk-js';

import {
  IPoolStatsReqParams,
  IPoolStatsReq,
  IPoolStats,
} from '../pool-stats-req-params';
import { Token } from '../core/tokens/model/token';

const CACHE_SIZE = 1;
const REFRESH_INTERVAL = 600000;

@Injectable({
  providedIn: 'root',
})
export class PairService {
  private cache$: Observable<IPoolStats[]>;
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';
  private readonly balancedDexContract =
    'cxa0af3165c08318e988cb30993b3048335b94af6c';
  httpProvider = new IconService.HttpProvider(this.address);
  iconService = new IconService(this.httpProvider);

  getPools(tokens: Token[]) {
    if (!this.cache$) {
      const timer$ = timer(0, REFRESH_INTERVAL);

      this.cache$ = timer$.pipe(
        switchMap((_) => this.requestPools(tokens)),
        shareReplay(CACHE_SIZE)
      );
    }
    return this.cache$;
  }

  private requestPools(tokens: Token[]) {
    const poolsIds = tokens.map((token) => token.pools);
    const poolIdsFlat: number[] = [].concat.apply([], poolsIds);
    const poolIdsUniq = [...new Set(poolIdsFlat)];

    const observables = poolIdsUniq.map((id) =>
      this.getPoolStatsOut(IconService.IconConverter.toHexNumber(id))
    );

    return zip(observables).pipe(
      map((pools) =>
        pools
          .filter((pool) => !isEmpty(pool))
          .map((pool) => this.smoothPoolResult(pool))
      )
    );
  }

  private getPoolStatsOut(poolId: string) {
    return this.http
      .post<IPoolStats>(this.address, this.getPoolStats(poolId))
      .pipe(
        catchError((_) => {
          console.log(`Error when fetching data from pool: ${poolId}`);
          return of({} as IPoolStats);
        })
      );
  }

  private getPoolStats(poolId: string) {
    const params: IPoolStatsReqParams = {
      to: this.balancedDexContract,
      dataType: 'call',
      data: {
        method: 'getPoolStats',
        params: {
          _id: `${poolId}`,
        },
      },
    };
    return this.makeRequest('icx_call', params);
  }

  private smoothPoolResult(resultDirty: IPoolStats): IPoolStats {
    return {
      ...resultDirty,
      result: {
        ...resultDirty.result,
        price: priceImpact(resultDirty, 1).toString(),
      },
    };
  }

  private makeRequest(
    method: string,
    params: IPoolStatsReqParams
  ): IPoolStatsReq {
    return {
      jsonrpc: '2.0',
      id: 1631894860562,
      method: method,
      params: params,
    };
  }
}
