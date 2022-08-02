import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { hexToDouble, isNotNullOrUndefined, isEmpty } from './utils/pair-utils';
import { Observable, timer } from 'rxjs';
import { concat, forkJoin, merge, zip, combineLatest } from 'rxjs';
import IconService from 'icon-sdk-js';

import {
  IPoolStatsReqParams,
  IPoolStatsReq,
  IPoolStats,
  ITokenName,
} from './pool-stats-req-params';
import { ITokenAltName } from './names';

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
  doTrade() {
    const smth = IconService.IconConverter.toUtf8(
      '0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637832363039623932346533336566303062363438613430393234356337656133393463343637383234222c226d696e696d756d52656365697665223a22323939313134363231373733363937393839222c2270617468223a5b22637833613336656131663662396161336432646439636236386538393837626363336161626161613838222c22637832363039623932346533336566303062363438613430393234356337656133393463343637383234225d7d7d'
    );
    console.log(smth);
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
    // return (
    //   parseInt(value, 16) / Number('1E' + parseInt(decimals, 16).toString())
    // );
  }
}
/**
 * 
 * {
 * SWAP bnUSD to sICX
    "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb", recipient is bnUSD contract
    "from": "hx97180db9263685f07bed00df5111481513ab30c1", me
    "nid": "0x1", idk
    "version": "0x3", idk
    "timestamp": "0x5e50abe017af8",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cx21e94c08c03daee80c25d8ee3ea22a20786ec231", balanced router contract
            "_value": "0x1812482108e2eeb", amount probably
            "_data": "0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637832363039623932346533336566303062363438613430393234356337656133393463343637383234222c226d696e696d756d52656365697665223a22323939313134363231373733363937393839222c2270617468223a5b22637833613336656131663662396161336432646439636236386538393837626363336161626161613838222c22637832363039623932346533336566303062363438613430393234356337656133393463343637383234225d7d7d"
        }
    }
}

Stability fund
{
    "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb",
    "from": "hx97180db9263685f07bed00df5111481513ab30c1",
    "nid": "0x1",
    "version": "0x3",
    "timestamp": "0x5e50b3354e948",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6",
            "_value": "0x1812482108e2eeb",
            "_data": "0x637862623238373166343638613330303866383062303866646465356238623935313538336163663036"
        }
    }
}

{"method":"_swap","params":{"toToken":"cx2609b924e33ef00b648a409245c7ea394c467824","minimumReceive":"299114621773697989","path":["cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88","cx2609b924e33ef00b648a409245c7ea394c467824"]}}
 */
