import { Component, OnInit } from '@angular/core';
import { PairService } from './pair.service';
import { GraphCalculationService } from '../graph-calculation.service';
import { TokenService } from '../core/tokens/token.service';
import { Token } from '../core/tokens/model/token';

import { Pool } from './pool';

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
  poolsNew: Array<Pool> = [];
  pathLogos: Map<string, string> = new Map<string, string>();
  tokens: Token[] = [];
  /* URL to the default logo when the token is such a shitcoin that even hasn't logo on Balanced :D */
  defaultLogo =
    'https://raw.githubusercontent.com/mirmich/balanced-arbitrageur/master/src/icons/assetLogos/shitcoin2.svg';

  ngOnInit() {
    this.init();
  }

  public async init() {
    this.tokenService.getTokens().subscribe((tokens) => {
      this.tokens = tokens;
      this.pairService.getPools().subscribe((pools) => {
        this.poolsNew = pools;
        this.poolsNew.forEach((pool) => {
          this.linkToLogo(pool.base_address);
          this.linkToLogo(pool.quote_address);
        });
        console.log(pools);
        const poolsFiltered = pools.filter((pool) => this.isLiquidNew(pool));
        const sICXtoICXPrice = pools.find(
          (pool) => pool.name == 'sICX/ICX'
        ).price;
        const sICXtobnUSDPrice = pools.find(
          (pool) => pool.name == 'sICX/bnUSD'
        ).price;
        const ICXPrice = (1.0 / sICXtoICXPrice) * sICXtobnUSDPrice;
        console.log(ICXPrice);
        console.log(poolsFiltered);
        this.graphService.initGraph(poolsFiltered, ICXPrice);
      });
    });
  }
  /**
   * Dummy liquidity assumption.
   * Any token that doesn't have at least $10,000
   * in liquidity across all of its pools will be filtered.
   * @param pool The pool that is valued in terms of liquidity
   */
  private isLiquidNew(pool: Pool): boolean {
    const baseToken = this.tokens.find(
      (token) => token.address === pool.base_address
    );
    return baseToken.price * pool.base_supply > 15000;
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
}
