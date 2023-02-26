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
  TradeParams,
} from './pool-stats-req-params';
import { ITokenAltName } from './names';
import { CallTransactionBuilder } from 'icon-sdk-js/build/builder/transaction/CallTransaction';
import { WalletProxyService } from './wallet-proxy.service';
import { ConsoleLogger } from '@angular/compiler-cli';

const CACHE_SIZE = 1;
const REFRESH_INTERVAL = 600000;

@Injectable({
  providedIn: 'root',
})
export class PairService {
  private cache$: Observable<IPoolStats[]>;
  constructor(
    private http: HttpClient,
    private walletProxyService: WalletProxyService
  ) {}

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
  //{"method":"_swap","params":{"toToken":"cx2609b924e33ef00b648a409245c7ea394c467824","minimumReceive":"299114621773697989","path":["cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88","cx2609b924e33ef00b648a409245c7ea394c467824"]}}
  /**
   * Executes the trade
   *
   * @param address The address of the swap smart contracts
   * @param tokenFrom The source token of the trade
   * @param tokenTo The target token of the trade
   * @param minimumRecieve0 The mininum that should be recieved after the trade
   * @param path0 The path that should be taken over when executing the trade e.g. bnUSD -> IUSDT -> sICX -> bnUSD
   */
  doTrade(
    address: string,
    tokenFrom: string,
    tokenTo: string,
    minimumRecieve0: string,
    path0: string[]
  ) {
    //const smth = 'Step limit ' + this.hexToUtf8('0x42c1d80');
    //console.log(smth);
    // TO DO -- you need to use REQUEST_JSON-RPC in order to send transaction
    const txObj = new IconService.IconBuilder.CallTransactionBuilder()
      .method('_swap')
      .params({
        toToken: tokenTo,
        minimumRecieve: minimumRecieve0,
        path0: path0,
      })
      .from(address)
      .to(tokenFrom)
      .stepLimit(this.toBigNumber('70000'))
      .nid(this.toBigNumber('3'))
      .nonce(this.toBigNumber('1'))
      .version(this.toBigNumber('3'))
      .timestamp(new Date().getTime() * 1000)
      .build();

    console.log(txObj);
    console.log(
      this.hexToUtf8(
        '0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637838386664376466376464666638326637636337333563383731646335313938333863623233356262222c226d696e696d756d52656365697665223a22313133333335363231353431373538353238222c2270617468223a5b22637838386664376466376464666638326637636337333563383731646335313938333863623233356262225d7d7d'
      )
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
    // return (
    //   parseInt(value, 16) / Number('1E' + parseInt(decimals, 16).toString())
    // );
  }

  doTrade2(
    address: string,
    tokenFrom: string,
    toToken: string,
    minimumRecieve0: string,
    path0: string[]
  ): any {
    //const smth = 'Step limit ' + this.hexToUtf8('0x42c1d80');
    //console.log(smth);
    // TO DO -- you need to use REQUEST_JSON-RPC in order to send transaction

    const data = {
      method: '_swap',
      params: {
        toToken: toToken,
        minimumRecieve: minimumRecieve0,
        path: path0,
      },
    };
    console.log(data);
    console.log(this.anyToHex(JSON.stringify(data)));
    const txObj = new IconService.IconBuilder.CallTransactionBuilder()
      .method('transfer')
      .params({
        _to: 'cxbb2871f468a3008f80b08fdde5b8b951583acf06', // Balanced router contract address
        _value: '0x19567b1c64cc571',
        _data: this.anyToHex(JSON.stringify(data)),
      })
      .from(address)
      .to(tokenFrom)
      .stepLimit('0x42c1d80')
      .nid('0x1')
      //.nonce(this.toBigNumber('1'))
      .version('0x3')
      .value('0x0')
      .timestamp(new Date().getTime() * 1000)
      .build();

    console.log(txObj);
    return IconService.IconConverter.toRawTransaction(txObj);
  }

  doTradeRPC(
    address: string,
    tokenFrom: string,
    toToken: string,
    minimumRecieve0: string,
    path0: string[]
  ): any {
    //const smth = 'Step limit ' + this.hexToUtf8('0x42c1d80');
    //console.log(smth);
    // TO DO -- you need to use REQUEST_JSON-RPC in order to send transaction

    const data = {
      method: '_swap',
      params: {
        toToken: toToken,
        minimumRecieve: minimumRecieve0,
        path: path0,
      },
    };
    const txObj = new IconService.IconBuilder.CallTransactionBuilder()
      .method('transfer')
      .params({
        _to: 'cxbb2871f468a3008f80b08fdde5b8b951583acf06', // Balanced router contract address
        _value: '0x19567b1c64cc571',
        _data: this.anyToHex(JSON.stringify(data)),
      })
      .from(address)
      .to(tokenFrom)
      .stepLimit('0x42c1d80')
      .nid('0x1')
      //.nonce(this.toBigNumber('1'))
      .version('0x3')
      .value('0x0')
      .timestamp(new Date().getTime() * 1000)
      .build();

    const rpcResult = {
      jsonrpc: '2.0',
      method: 'icx_sendTransaction',
      id: 1234,
      params: {
        version: '0x3',
        from: 'hx97180db9263685f07bed00df5111481513ab30c1',
        to: tokenFrom,
        stepLimit: '0x42c1d80',
        timestamp: IconService.IconConverter.toHexNumber(
          new Date().getTime() * 1000
        ),
        nid: '0x1',
        nonce: '0x1',
        dataType: 'call',
        data: {
          method: 'transfer',
          params: {
            _to: 'cx21e94c08c03daee80c25d8ee3ea22a20786ec231',
            _value: '0x19567b1c64cc571',
            _data: this.anyToHex(JSON.stringify(data)),
          },
        },
      },
    };
    return rpcResult;
  }
}

/**
 * {
    "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb",
    "from": "hx97180db9263685f07bed00df5111481513ab30c1",
    "nid": "0x1",
    "version": "0x3",
    "timestamp": "0x5f59e7100d498",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cx21e94c08c03daee80c25d8ee3ea22a20786ec231",
            "_value": "0x16345785d8a0000",
            "_data": "0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637862623238373166343638613330303866383062303866646465356238623935313538336163663036222c226d696e696d756d52656365697665223a223938303232393635343338383536323834222c2270617468223a5b22637862623238373166343638613330303866383062303866646465356238623935313538336163663036225d7d7d"
        }
    }
}
 */

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

{
  USDS TO bnUSd
    "to": "cxbb2871f468a3008f80b08fdde5b8b951583acf06", source token e.g USDS
    "from": "hx97180db9263685f07bed00df5111481513ab30c1",
    "nid": "0x1",
    "version": "0x3",
    "timestamp": "0x5f0d51de51918",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cx21e94c08c03daee80c25d8ee3ea22a20786ec231",
            "_value": "0x19567b1c64cc571",
            "_data": "0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637838386664376466376464666638326637636337333563383731646335313938333863623233356262222c226d696e696d756d52656365697665223a22313133333335363231353431373538353238222c2270617468223a5b22637838386664376466376464666638326637636337333563383731646335313938333863623233356262225d7d7d"
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


 */
