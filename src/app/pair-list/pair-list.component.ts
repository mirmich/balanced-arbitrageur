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

  private hexToDouble(numberInHex: string) {
    return parseInt(numberInHex.substring(2), 16) / 1000000000000000000;
  }

  public init() {
    const observer: Observer<IPoolStats> = {
      next: (x: IPoolStats) => this.pools.push(this.smoothPoolResult(x)),
      error: (err: string) => console.log(),
      complete: () => console.log(),
    };

    for (let i = 1; i < 100; i++) {
      const prd = this.pairService
        .getPoolStatsOut('0x' + i.toString(16))
        .subscribe(observer);
    }
  }
  private smoothPoolResult(resultDirty: IPoolStats): IPoolStats {
    const smoothed = this.hexToDouble(resultDirty.result.price).toString();
    let p1 = {
      ...resultDirty
    };
    p1.result.price = smoothed;
    return p1;
  }
}
