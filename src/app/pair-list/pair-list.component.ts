import { Component, OnInit } from '@angular/core';
import { PairService } from '../pair.service';
import { Observable, throwError, Observer } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPoolStats } from '../pool-stats-req-params';
import { firstValueFrom } from 'rxjs';
import { ITokenAltName } from '../names';
import { GraphCalculationService } from '../graph-calculation.service';

@Component({
  selector: 'app-pair-list',
  templateUrl: './pair-list.component.html',
  styleUrls: ['./pair-list.component.css'],
})
export class PairListComponent implements OnInit {
  constructor(private pairService: PairService, private graphService: GraphCalculationService) {}
  pairs = this.pairService.getPrices();

  pools: Array<IPoolStats> = [];
  altNames: Array<ITokenAltName> = [];

  ngOnInit() {
    this.init();
    this.graphService.initGraph();
  }

  private hexToDouble(numberInHex: string, decimal: number = 0) {
    const resTemp =
      parseInt(numberInHex.substring(2), 16) / Math.pow(10, decimal);
    const res = resTemp > 100000000 ? resTemp / Math.pow(10, 24) : resTemp;
    return res;
  }

  public async init() {
    this.altNames = (await firstValueFrom(this.pairService.getNames()));
    const observer: Observer<IPoolStats> = {
      next: async (poolStats: IPoolStats) =>
        this.hasName(poolStats)
          ? this.pools.push(this.smoothPoolResult(poolStats))
          : this.pools.push(
              this.smoothPoolResult(await this.resolveName(poolStats))
            ),
      error: (err: string) => console.log(),
      complete: () => console.log(),
    };

    for (let i = 1; i < 100; i++) {
      const prd = this.pairService
        .getPoolStatsOut('0x' + i.toString(16))
        //.pipe(map(val => this.resolveName(val)))
        .subscribe(observer);
    }
  }

  private hasName(poolStats: IPoolStats) {
    return (
      poolStats.result.name !== null && poolStats.result.name !== undefined
    );
  }

  private async resolveName(poolStats: IPoolStats) {
    if (this.hasName(poolStats)) {
      return poolStats;
    } else {
      const nameBase = await firstValueFrom(
        this.pairService.getTokenNameOut(poolStats.result.base_token)
      );
      const altNameBase = this.altNames.find(el => el.name === nameBase.result);
      const nameQuote = await firstValueFrom(
        this.pairService.getTokenNameOut(poolStats.result.quote_token)
      );
      const altNameQuote = this.altNames.find(el => el.name === nameQuote.result);
      const nameBaseRes = (altNameBase === undefined) ? nameBase.result : altNameBase.ticker;
      const nameQuoteRes = (altNameQuote === undefined) ? nameQuote.result : altNameQuote.ticker;
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
    // console.log(resultDirty);
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
