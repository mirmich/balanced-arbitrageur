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
    this.pairService.getPricesReal().subscribe((result) => console.log(result));
  }
}
