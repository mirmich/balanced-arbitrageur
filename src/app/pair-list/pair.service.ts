import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { hexToDouble, isEmpty } from '../utils/pair-utils';
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

    const indx = [...Array(count).keys()];
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

  private anyToHex(str: string) {
    return IconService.IconConverter.toHex(str);
  }
  private hexToUtf8(hex: string) {
    return IconService.IconConverter.toUtf8(hex);
  }

  private toBigNumber(bigNum: string) {
    return IconService.IconConverter.toBigNumber(bigNum);
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
    //const liquidity = hexToDouble(resultDirty.result.total_supply, decimal);
    let p1 = {
      ...resultDirty,
    };
    p1.result.price = this.priceImpact(resultDirty, 1).toString();

    //p1.result.total_supply = liquidity.toString();
    return p1;
  }

  private priceImpact(pool: IPoolStats, value: number): number {
    if (pool.result.name == 'sICX/ICX') {
      return hexToDouble(
        pool.result.price,
        parseInt(pool.result.base_decimals.substring(2), 16)
      );
    } else {
      const tokenALiq = this.hexToDecimalWithPrecision(
        pool.result.base,
        pool.result.base_decimals
      );
      const tokenBLiq = this.hexToDecimalWithPrecision(
        pool.result.quote,
        pool.result.quote_decimals
      );
      const poolFactor = tokenALiq * tokenBLiq;
      return tokenBLiq - poolFactor / (value + tokenALiq);
    }
  }

  private hexToDecimalWithPrecision(value: string, decimals: string): number {
    const parsed =
      parseInt(value, 16) / Number('1E' + parseInt(decimals, 16).toString());
    const adjusted = parsed > 100000000 ? parsed / Math.pow(10, 12) : parsed;
    const adjustedAgain =
      adjusted > 100000000 ? adjusted / Math.pow(10, 12) : adjusted;
    return adjustedAgain;
  }
}
