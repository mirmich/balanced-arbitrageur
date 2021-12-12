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
      next: (x: IPoolStats) =>
        console.log('Observer got a next value: ' + x.result.name),
      error: (err: string) => console.log(),
      complete: () => console.log(),
    };
    for (let i = 1; i < 100; i++) {
      this.pairService
        .getPoolStatsOut('0x' + i.toString(16))
        .subscribe(observer);
    }
  }
}
