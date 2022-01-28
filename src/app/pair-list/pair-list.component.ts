import { Component, OnInit } from '@angular/core';
import { PairService } from '../pair.service';
import { Observable, throwError, Observer } from 'rxjs';
import { IPoolStats } from '../pool-stats-req-params';

@Component({
  selector: 'app-pair-list',
  templateUrl: './pair-list.component.html',
  styleUrls: ['./pair-list.component.css'],
})
export class PairListComponent implements OnInit {
  constructor(private pairService: PairService) {}
  pairs = this.pairService.getPrices();

  pools: Array<IPoolStats> = [];

  ngOnInit() {
    this.pairService.getPoolStatsOut('0x11').subscribe((res) => {
      console.log(this.hexToDouble(res.result.price));
      console.log(res.result.name);
    });
    this.init();
  }

  private hexToDouble(numberInHex: string, decimal: number = 0) {
    const resTemp =
      parseInt(numberInHex.substring(2), 16) / Math.pow(10, decimal);
    const res = resTemp > 100000000 ? resTemp / Math.pow(10, 24) : resTemp;
    return res;
  }

  public init() {
    const observer: Observer<IPoolStats> = {
      next: (poolStats: IPoolStats) =>
        this.hasName(poolStats)
          ? this.pools.push(this.smoothPoolResult(poolStats))
          : this.resolveName(poolStats),
      error: (err: string) => console.log(),
      complete: () => console.log(),
    };

    for (let i = 1; i < 100; i++) {
      const prd = this.pairService
        .getPoolStatsOut('0x' + i.toString(16))
        .subscribe(observer);
    }
  }

  private hasName(poolStats: IPoolStats) {
    return (
      poolStats.result.name !== null && poolStats.result.name !== undefined
    );
  }

  private resolveName(poolStats: IPoolStats) {
    console.log(this.smoothPoolResult(poolStats));
  }

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
