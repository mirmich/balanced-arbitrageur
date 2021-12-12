import { Component, OnInit } from '@angular/core';
import { PairService } from '../pair.service';

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
  }

  hexToDouble(numberInHex: string) {
    return parseInt(numberInHex.substring(2), 16) / 1000000000000000000;
  }
}
