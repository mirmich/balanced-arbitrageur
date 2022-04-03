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
import { resetFakeAsyncZone } from '@angular/core/testing';

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
    const resTemp1 = resTemp > 100000000 ? resTemp / Math.pow(10, 12) : resTemp;
    const res = resTemp1 > 100000000 ? resTemp1 / Math.pow(10, 12) : resTemp1;
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
    }
    const observables = indices.map((x) =>
      this.pairService.getPoolStatsOut('0x' + x.toString(16))
    );
    forkJoin(observables).subscribe(observer);
  }

  private tranformNames() {
    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        poolStats.forEach((x) => this.poolsGroomed.push(x));
      },
      error: (err: string) => console.log(err),
      complete: () => this.graphService.initGraph(this.poolsGroomed),
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
