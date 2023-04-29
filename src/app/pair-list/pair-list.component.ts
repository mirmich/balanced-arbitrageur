import { Component, OnInit } from '@angular/core';
import { PairService } from './pair.service';
import { mergeMap, Observable, Observer } from 'rxjs';
import { forkJoin, of } from 'rxjs';
import { IPoolStats } from '../pool-stats-req-params';
import { firstValueFrom } from 'rxjs';
import { ITokenAltName } from './model/names';
import { GraphCalculationService } from '../graph-calculation.service';
import { priceImpact } from '../utils/pair-utils';
import { TokenService } from '../core/tokens/token.service';
import { Token } from '../core/tokens/model/token';

@Component({
  selector: 'app-pair-list',
  templateUrl: './pair-list.component.html',
  styleUrls: ['./pair-list.component.css'],
})
export class PairListComponent implements OnInit {
  constructor(
    private pairService: PairService,
    private tokenService: TokenService,
    private graphService: GraphCalculationService
  ) {}

  pools: Array<IPoolStats> = [];
  poolsGroomed: Array<IPoolStats> = [];
  altNames: Array<ITokenAltName> = [];
  pathLogos: Map<string, string> = new Map<string, string>();
  tokens: Token[] = [];
  /* URL to the default logo when the token is such a shitcoin that even hasn't logo on Balanced :D */
  defaultLogo =
    'https://raw.githubusercontent.com/mirmich/balanced-arbitrageur/master/src/icons/assetLogos/shitcoin2.svg';

  ngOnInit() {
    this.init();
  }

  public async init() {
    this.altNames = await firstValueFrom(this.pairService.getNames());

    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        this.pools = [];
        poolStats.forEach(async (poolStat) => {
          this.pools.push(poolStat);
        });
        this.tranformNames();
      },
      error: (err: string) => console.log(err),
      complete: () => null,
    };
    this.tokenService
      .getTokens()
      .pipe(
        mergeMap((tokens) => {
          this.tokens = tokens;
          return this.pairService.getPoolsIds(tokens);
        })
      )
      .subscribe(observer);
  }

  private tranformNames() {
    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        this.poolsGroomed = [];
        poolStats.forEach((x) => {
          this.poolsGroomed.push(x);
          this.linkToLogoOff(x.result.base_token);
          this.linkToLogoOff(x.result.quote_token);
        });
      },
      error: (err: string) => console.log(err),
      complete: () => {
        const sICXtoICXPrice = parseFloat(
          this.poolsGroomed.find((pool) => pool.result.name == 'sICX/ICX')
            .result.price
        );
        const sICXtobnUSDPrice = parseFloat(
          this.poolsGroomed.find((pool) => pool.result.name == 'sICX/bnUSD')
            .result.price
        );
        const ICXPrice = (1.0 / sICXtoICXPrice) * sICXtobnUSDPrice;
        this.poolsGroomed.forEach((x) => this.isLiquid(x));

        this.graphService.initGraph(this.poolsGroomed, ICXPrice);
      },
    };

    const poolsGroomed: Array<Observable<IPoolStats>> = this.pools.map(
      (pool) => {
        if (this.hasName(pool)) {
          return of(pool);
        }
        const baseTokenName = this.getTokenName(pool.result.base_token);
        const quoteTokenName = this.getTokenName(pool.result.quote_token);
        pool.result.name = `${baseTokenName}/${quoteTokenName}`;
        return of(pool);
      }
    );
    const smting = forkJoin(poolsGroomed);

    smting.subscribe(observer);
  }

  private isLiquid(pool: IPoolStats) {
    const name = pool.result.name;
    const neco = priceImpact(pool, 1);
  }

  private linkToLogoOff(address: string) {
    // There needs to be extra handling for ICX as it's native ICX token
    const logoUri = this.tokens.find(
      (token) =>
        token.address === address ||
        (address === null && token.address === 'ICX')
    ).logo_uri;
    const logoUriResolved = logoUri !== null ? logoUri : this.defaultLogo;
    this.pathLogos.set(address, logoUriResolved);
  }

  private hasName(poolStats: IPoolStats) {
    return (
      poolStats?.result?.name !== null && poolStats?.result?.name !== undefined
    );
  }

  private getTokenName(address: string): string {
    return this.tokens.find((token) => token.address === address).symbol;
  }
}
