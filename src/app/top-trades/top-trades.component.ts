import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphCalculationService } from '../graph-calculation.service';
import { PairService } from '../pair.service';
import { WalletProxyService } from '../wallet-proxy.service';
import { ArtbitraguePath } from './model';

@Component({
  selector: 'app-top-trades',
  templateUrl: './top-trades.component.html',
  styleUrls: ['./top-trades.component.css'],
})
export class TopTradesComponent implements OnDestroy {
  private readonly arbitragueSubscription: Subscription;

  public arbitragues: Array<ArtbitraguePath> = [];
  constructor(
    private graphService: GraphCalculationService,
    private pairService: PairService,
    private walletProxyService: WalletProxyService
  ) {
    this.arbitragueSubscription = this.graphService.mostProfitable.subscribe(
      (profitableArb) => {
        this.arbitragues = profitableArb;
      }
    );
  }
  public trade(): void {
    const result = this.pairService.doTradeRPC(
      'hx97180db9263685f07bed00df5111481513ab30c1',
      'cxbb2871f468a3008f80b08fdde5b8b951583acf06',
      'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
      '113335621541758528',
      ['cx88fd7df7ddff82f7cc735c871dc519838cb235bb']
    );
    console.log(result);
    this.walletProxyService.dispatchEvent(
      'ICONEX_RELAY_REQUEST',
      'REQUEST_JSON-RPC',
      result
    );
  }

  public ngOnDestroy(): void {
    this.arbitragueSubscription.unsubscribe();
  }
}
