import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphCalculationService } from '../graph-calculation.service';
import { ArtbitraguePath } from './model';

@Component({
  selector: 'app-top-trades',
  templateUrl: './top-trades.component.html',
  styleUrls: ['./top-trades.component.css'],
})
export class TopTradesComponent implements OnDestroy {
  private readonly arbitragueSubscription: Subscription;

  public arbitragues: Array<ArtbitraguePath> = [];
  constructor(private graphService: GraphCalculationService) {
    this.arbitragueSubscription = this.graphService.mostProfitable.subscribe(
      (profitableArb) => {
        this.arbitragues = profitableArb;
      }
    );
  }

  public ngOnDestroy(): void {
    this.arbitragueSubscription.unsubscribe();
  }
}
