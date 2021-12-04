import { Component, OnInit } from '@angular/core';
import { PriceService } from '../price.service';

@Component({
  selector: 'app-pair-list',
  templateUrl: './pair-list.component.html',
  styleUrls: ['./pair-list.component.css'],
})
export class PairListComponent implements OnInit {
  pairs = this.priceService.getPrices();

  constructor(private priceService: PriceService) {}

  ngOnInit() {}
}
