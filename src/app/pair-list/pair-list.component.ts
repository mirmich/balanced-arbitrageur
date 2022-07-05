import { Component, OnInit } from '@angular/core';
import { PairService } from '../pair.service';
import { Observable, throwError, Observer } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { concat, forkJoin, merge, zip, of } from 'rxjs';
import { IPoolStats, ITokenName } from '../pool-stats-req-params';
import { firstValueFrom } from 'rxjs';
import { ITokenAltName } from '../names';
import { GraphCalculationService } from '../graph-calculation.service';
import * as _ from 'lodash';
import { AssetLogosService } from '../asset-logos.service';
import { hexToDouble } from '../utils/pair-utils';

@Component({
  selector: 'app-pair-list',
  templateUrl: './pair-list.component.html',
  styleUrls: ['./pair-list.component.css'],
})
export class PairListComponent implements OnInit {
  constructor(
    private pairService: PairService,
    private graphService: GraphCalculationService,
    private assetLogosService: AssetLogosService
  ) {}

  pools: Array<IPoolStats> = [];
  poolsGroomed: Array<IPoolStats> = [];
  altNames: Array<ITokenAltName> = [];
  pathLogos: Map<string, string> = new Map<string, string>();

  ngOnInit() {
    this.init();
  }

  public async init() {
    this.altNames = await firstValueFrom(this.pairService.getNames());

    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        this.pools = [];
        console.log('Bam');
        poolStats.forEach(async (poolStat) => {
          this.pools.push(poolStat);
        });
        this.tranformNames();
      },
      error: (err: string) => console.log(err),
      complete: () => null,
    };
    this.pairService.getPools(48).subscribe(observer);
  }

  private tranformNames() {
    const observer: Observer<IPoolStats[]> = {
      next: (poolStats: IPoolStats[]) => {
        this.poolsGroomed = [];
        poolStats.forEach((x) => {
          this.poolsGroomed.push(x);
          this.linkToLogo(x.result.base_token);
          this.linkToLogo(x.result.quote_token);
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
        const metxbnUSD = this.poolsGroomed.find(
          (pool) => pool.result.name == 'METX/bnUSD'
        ).result;
        this.graphService.initGraph(this.poolsGroomed, ICXPrice);
      },
    };

    const poolsGroomed: Array<Observable<IPoolStats>> = this.pools.map(
      (pool) => {
        if (this.hasName(pool)) {
          return of(pool);
        }
        const baseToken = this.getTokenName(pool.result.base_token);
        const quoteToken = this.getTokenName(pool.result.quote_token);

        const result = zip(baseToken, quoteToken).pipe(
          map((tokenNames) => {
            let p1 = { ...pool };
            p1.result.name = `${tokenNames[0]}/${tokenNames[1]}`;
            return p1;
          })
        );
        return result;
      }
    );
    const smting = forkJoin(poolsGroomed);

    smting.subscribe(observer);
  }

  private linkToLogo(token: string) {
    this.assetLogosService.getAssetLogo(token).subscribe((link) => {
      this.pathLogos.set(token, link);
    });
  }

  private hasName(poolStats: IPoolStats) {
    return (
      poolStats?.result?.name !== null && poolStats?.result?.name !== undefined
    );
  }

  private getTokenName(token: string): Observable<string> {
    return this.pairService
      .getTokenNameOut(token)
      .pipe(map((name) => this.resolveName(name as ITokenName)));
  }

  private resolveName(name: ITokenName): string {
    const altName = this.altNames.find((el) => el.name === name.result);
    return altName === undefined ? name.result : altName.ticker;
  }

  private priceImpact(pool: IPoolStats, value: number): number {
    const tokenALiq = hexToDouble(
      pool.result.base,
      parseFloat(pool.result.base_decimals)
    );
    const tokenBLiq = hexToDouble(
      pool.result.quote,
      parseFloat(pool.result.quote_decimals)
    );
    const poolFactor = tokenALiq * tokenBLiq;
    return tokenBLiq - poolFactor / (value + tokenALiq);
  }
}
