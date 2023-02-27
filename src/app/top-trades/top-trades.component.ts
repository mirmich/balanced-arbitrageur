import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphCalculationService } from '../graph-calculation.service';
import { PairService } from '../pair.service';
import { TradeService } from '../trade.service';
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
    private walletProxyService: WalletProxyService,
    private tradeService: TradeService
  ) {
    this.arbitragueSubscription = this.graphService.mostProfitable.subscribe(
      (profitableArb) => {
        this.arbitragues = profitableArb;
      }
    );
  }
  // cxbb2871f468a3008f80b08fdde5b8b951583acf06
  public trade(): void {
    const result = this.tradeService.doTradeRPC(
      'cx21e94c08c03daee80c25d8ee3ea22a20786ec231',
      'cx88fd7df7ddff82f7cc735c871dc519838cb235bb',
      'cxbb2871f468a3008f80b08fdde5b8b951583acf06',
      '92022965438856284', // Needs to be divided by 100000000000000000 to know the actual amount, the number will depend on token/pool
      ['cxbb2871f468a3008f80b08fdde5b8b951583acf06']
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
