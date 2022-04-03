import { Component, OnInit } from '@angular/core';
import { PairService } from '../pair.service';
import { Observable, throwError, Observer } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { concat, forkJoin, merge } from 'rxjs';
import { IPoolStats } from '../pool-stats-req-params';
import { firstValueFrom } from 'rxjs';
import { ITokenAltName } from '../names';
import { GraphCalculationService } from '../graph-calculation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-pair-list',
  templateUrl: './pair-list.component.html',
  styleUrls: ['./pair-list.component.css'],
})
export class PairListComponent implements OnInit {
  constructor(
    private pairService: PairService,
    private graphService: GraphCalculationService
  ) {}
  pairs = this.pairService.getPrices();

  pools: Array<IPoolStats> = [];
  poolsGroomed: Array<IPoolStats> = [];
  altNames: Array<ITokenAltName> = [];

  ngOnInit() {
    this.init();
  }

  private hexToDouble(numberInHex: string, decimal: number = 0) {
    const resTemp =
      parseInt(numberInHex.substring(2), 16) / Math.pow(10, decimal);
    const res = resTemp > 100000000 ? resTemp / Math.pow(10, 24) : resTemp;
    return res;
  }

  public async init() {
    this.altNames = await firstValueFrom(this.pairService.getNames());

    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        poolStats.forEach(async (poolStat) => {
          if (!_.isEmpty(poolStat)) {
            this.pools.push(this.smoothPoolResult(poolStat));
          }
        });
      },
      error: (err: string) => console.log(err),
      complete: () => this.tranformNames(),
    };

    var indices: Array<number> = [];
    // Find all possible pools listed on Balanced
    for (let i = 1; i < 50; i++) {
      indices.push(i);
      // const prd = this.pairService
      //   .getPoolStatsOut('0x' + i.toString(16))
      //   .subscribe(observer);
    }
    const observables = indices.map((x) =>
      this.pairService.getPoolStatsOut('0x' + x.toString(16))
    );
    const smthing = forkJoin(observables);

    smthing.subscribe(observer);

    //this.graphService.initGraph(this.pools);
  }

  private tranformNames() {
    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        poolStats.forEach((x) => this.poolsGroomed.push(x));
      },
      error: (err: string) => console.log(err),
      complete: () => console.log(this.poolsGroomed),
    };

    const poolsGroomed: Array<Observable<IPoolStats>> = this.pools.map(
      (pool) => {
        const baseToken = this.pairService
          .getTokenNameOut(pool.result.base_token)
          .pipe(
            map((name) => {
              const altName = this.altNames.find(
                (el) => el.name === name.result
              );
              return altName === undefined ? name.result : altName.ticker;
            })
          );
        const quoteToken = this.pairService
          .getTokenNameOut(pool.result.quote_token)
          .pipe(
            map((name) => {
              const altName = this.altNames.find(
                (el) => el.name === name.result
              );
              return altName === undefined ? name.result : altName.ticker;
            })
          );
        const result = forkJoin(Array(baseToken, quoteToken)).pipe(
          map((tokenNames) => {
            if (this.hasName(pool)) {
              return pool;
            }
            let p1 = {
              ...pool,
            };
            p1.result.name = `${tokenNames[0]}/${tokenNames[1]}`;
            return p1;
          })
        );
        return result;
      }
    );
    const smting = forkJoin(poolsGroomed);
    smting.subscribe(observer);
  }

  private hasName(poolStats: IPoolStats) {
    return (
      poolStats?.result?.name !== null && poolStats?.result?.name !== undefined
    );
  }

  private async resolveName(poolStats: IPoolStats): Promise<IPoolStats> {
    if (this.hasName(poolStats)) {
      return poolStats;
    } else {
      const nameBase = await firstValueFrom(
        this.pairService.getTokenNameOut(poolStats.result.base_token)
      );
      const altNameBase = this.altNames.find(
        (el) => el.name === nameBase.result
      );
      const nameQuote = await firstValueFrom(
        this.pairService.getTokenNameOut(poolStats.result.quote_token)
      );
      const altNameQuote = this.altNames.find(
        (el) => el.name === nameQuote.result
      );
      const nameBaseRes =
        altNameBase === undefined ? nameBase.result : altNameBase.ticker;
      const nameQuoteRes =
        altNameQuote === undefined ? nameQuote.result : altNameQuote.ticker;
      const poolName =
        (poolStats.result.name = `${nameBaseRes}/${nameQuoteRes}`);
      let p1 = {
        ...poolStats,
      };
      p1.result.name = poolName;
      return p1;
    }
  }

  private prettifyName(name: string) {}

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
    const smoothed = this.hexToDouble(
      resultDirty.result.price,
      decimal
    ).toString();
    let p1 = {
      ...resultDirty,
    };
    p1.result.price = smoothed;
    return p1;
  }
}
