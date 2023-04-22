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
  ITokenName,
} from '../pool-stats-req-params';
import { ITokenAltName } from './model/names';

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

  getNames() {
    return this.http.get<ITokenAltName[]>('/assets/names.json');
  }

  getPools(count: number) {
    if (!this.cache$) {
      const timer$ = timer(0, REFRESH_INTERVAL);

      this.cache$ = timer$.pipe(
        switchMap((_) => this.requestPools(count)),
        shareReplay(CACHE_SIZE)
      );
    }
    return this.cache$;
  }

  requestPools(count: number) {
    var indices: Array<number> = [];
    // Find all possible pools listed on Balanced
    for (let i = 1; i < count; i++) {
      indices.push(i);
    }

    const observables = [...Array(count).keys()].map((x) =>
      this.getPoolStatsOut('0x' + x.toString(16))
    );

    return zip(observables).pipe(
      map((pools) =>
        pools
          .filter((pool) => !isEmpty(pool))
          .map((pool) => this.smoothPoolResult(pool))
      )
    );
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

  private getPoolStatsOut(poolId: string) {
    return this.http
      .post<IPoolStats>(this.address, this.getPoolStats(poolId))
      .pipe(
        catchError((error) => {
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

  private getTokenName(tokenAddress: String) {
    const params: IPoolStatsReqParams = {
      to: `${tokenAddress}`,
      dataType: 'call',
      data: {
        method: 'name',
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
