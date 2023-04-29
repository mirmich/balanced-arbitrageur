import { Component, OnInit } from '@angular/core';
import { PairService } from './pair.service';
import { mergeMap, Observer } from 'rxjs';
import { IPoolStats } from '../pool-stats-req-params';
import { GraphCalculationService } from '../graph-calculation.service';
import { TokenService } from '../core/tokens/token.service';
import { Token } from '../core/tokens/model/token';
import IconService from 'icon-sdk-js';
import { hexToDecimalWithPrecision } from '../utils/pair-utils';

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
  pathLogos: Map<string, string> = new Map<string, string>();
  tokens: Token[] = [];
  /* URL to the default logo when the token is such a shitcoin that even hasn't logo on Balanced :D */
  defaultLogo =
    'https://raw.githubusercontent.com/mirmich/balanced-arbitrageur/master/src/icons/assetLogos/shitcoin2.svg';

  ngOnInit() {
    this.init();
  }

  public async init() {
    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        this.pools = [];
        poolStats.forEach(async (poolStat) => {
          this.pools.push(poolStat);
        });
        this.tranformNamesNew();
      },
      error: (err: string) => console.log(err),
      complete: () => null,
    };

    this.tokenService
      .getTokens()
      .pipe(
        mergeMap((tokens) => {
          this.tokens = tokens;
          return this.pairService.getPools(tokens);
        })
      )
      .subscribe(observer);
  }

  private tranformNamesNew() {
    const poolsGroomed = this.pools.map((pool) => {
      if (this.hasName(pool)) {
        return pool;
      }
      const baseTokenName = this.getTokenName(pool.result.base_token);
      const quoteTokenName = this.getTokenName(pool.result.quote_token);
      pool.result.name = `${baseTokenName}/${quoteTokenName}`;
      return pool;
    });
    poolsGroomed.forEach((x) => {
      this.poolsGroomed.push(x);
      this.linkToLogo(x.result.base_token);
      this.linkToLogo(x.result.quote_token);
    });
    const sICXtoICXPrice = parseFloat(
      this.poolsGroomed.find((pool) => pool.result.name == 'sICX/ICX').result
        .price
    );
    const sICXtobnUSDPrice = parseFloat(
      this.poolsGroomed.find((pool) => pool.result.name == 'sICX/bnUSD').result
        .price
    );
    const ICXPrice = (1.0 / sICXtoICXPrice) * sICXtobnUSDPrice;
    const filteredPools = this.poolsGroomed.filter((pool) =>
      this.isLiquid(pool)
    );
    console.log(filteredPools);
    this.graphService.initGraph(filteredPools, ICXPrice);
  }

  /**
   * Dummy liquidity assumption.
   * Any token that doesn't have at least $10,000
   * in liquidity across all of its pools will be filtered.
   * @param pool The pool that is valued in terms of liquidity
   */
  private isLiquid(pool: IPoolStats): boolean {
    const baseToken = this.tokens.find(
      (token) => token.address === pool.result.base_token
    );
    const quoteToken = this.tokens.find(
      (token) => token.address === pool.result.quote_token
    );
    if (baseToken === undefined || quoteToken === undefined) {
      return false;
    }
    const baseTokenLiq = hexToDecimalWithPrecision(
      pool.result.base,
      pool.result.base_decimals
    );
    console.log(baseTokenLiq);
    return baseToken.price * baseTokenLiq > 15000;
  }

  private linkToLogo(address: string) {
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
