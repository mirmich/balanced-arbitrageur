import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WalletProxyService } from '../core/walllet/service/wallet-proxy.service';
import { GraphCalculationService } from '../graph-calculation.service';
import { TradeService } from '../trade.service';
import { ArtbitraguePath } from './model';

@Component({
  selector: 'app-top-trades',
  templateUrl: './top-trades.component.html',
  styleUrls: ['./top-trades.component.css'],
})
export class TopTradesComponent implements OnDestroy {
  private readonly arbitragueSubscription: Subscription;
  private readonly balancedRouterContract: string =
    'cx21e94c08c03daee80c25d8ee3ea22a20786ec231';

  public arbitragues: Array<ArtbitraguePath> = [];

  constructor(
    private graphService: GraphCalculationService,
    private walletProxyService: WalletProxyService,
    private tradeService: TradeService
  ) {
    this.arbitragueSubscription = this.graphService.mostProfitable.subscribe(
      (profitableArb) => {
        this.arbitragues = profitableArb;
      }
    );
  }

  public trade(index: number): void {
    const path = this.arbitragues[index].cycle.map(
      (trade) => trade.tokenToContract
    );
    path.pop();
    this.tradeService
      .doTradeRPC(
        this.balancedRouterContract,
        this.arbitragues[index].cycle[0].tokenFromContract,
        this.arbitragues[index].cycle[0].tokenFromContract,
        '92022965438856284', // Needs to be divided by 100000000000000000 to know the actual amount, the number will depend on token/pool
        path
      )
      .subscribe((walletRequest) => {
        console.log(walletRequest);
        this.walletProxyService.dispatchEvent(
          'ICONEX_RELAY_REQUEST',
          'REQUEST_JSON-RPC',
          walletRequest
        );
      });
  }

  public ngOnDestroy(): void {
    this.arbitragueSubscription.unsubscribe();
  }
}
