import { Injectable } from '@angular/core';
import Graph from 'graphology';
import { dfs } from 'graphology-traversal/dfs';
import { allSimpleEdgePaths, allSimplePaths } from 'graphology-simple-path';
import { Attributes } from 'graphology-types';
import { IPoolStats } from './pool-stats-req-params';
import { Observable, Subject } from 'rxjs';
import { ArtbitraguePath, SingleArbitrague } from './top-trades/model';

type NodeType = { name: string };

@Injectable({
  providedIn: 'root',
})
export class GraphCalculationService {
  constructor() {}
  private graph = new Graph();
  private mostProfitableSource = new Subject<Array<ArtbitraguePath>>();
  private mostProfitableArb: Observable<Array<ArtbitraguePath>> =
    this.mostProfitableSource.asObservable();

  private blackListedPools: Array<string> = Array(
    'LambdaX/bnUSD',
    'LambdaX/USDS',
    'LambdaX/sICX',
    'sICX/IUSDC',
    'IAM/sICX',
    'IAM/bnUSD',
    'IAM/IUSDC',
    'CODA/bnUSD',
    'NOTMIRAI/bnUSD',
    'NOTMIRAI/USDS',
    'NOTMIRAI/IUSDC',
    'CHIU/bnUSD',
    'Claw/sICX',
    'CHKN/sICX',
    'iDoge/bnUSD',
    'iDoge/IUSDC',
    'iDoge/sICX',
    'GBET/USDS',
    'GBET/bnUSD',
    'GBET/sICX',
    'USDS/IUSDC',
    'FIN/IUSDC',
    'IUSDT/IUSDC',
    'sICX/USDS'
  );

  public get mostProfitable(): Observable<Array<ArtbitraguePath>> {
    return this.mostProfitableArb;
  }

  public initGraph(pools: Array<IPoolStats>, icxPriceInBnUSD: number) {
    pools
      .filter((pool) => !(this.blackListedPools.indexOf(pool.result.name) > -1))
      .forEach((pool) => {
        const names = pool.result.name.split('/');

        // Add base token
        if (!this.graph.hasNode(names[0])) {
          this.graph.addNode(names[0]);
        }
        // Add quote token
        if (!this.graph.hasNode(names[1])) {
          this.graph.addNode(names[1]);
        }
        const firstEdge = `${names[0]}->${names[1]}`;
        const secondEdge = `${names[1]}->${names[0]}`;

        if (!this.graph.hasDirectedEdge(firstEdge)) {
          this.graph.addDirectedEdgeWithKey(firstEdge, names[0], names[1], {
            price: parseFloat(pool.result.price),
          });
        }

        if (!this.graph.hasDirectedEdge(secondEdge)) {
          this.graph.addDirectedEdgeWithKey(secondEdge, names[1], names[0], {
            price: 1 / parseFloat(pool.result.price),
          });
        }
      });
    const cycles = this.findAllCyclesForNode('bnUSD');
    const cyclesEnriched = this.enrichCycles(cycles);

    const cyclesFiltered = this.filterCycles(cyclesEnriched, icxPriceInBnUSD);
    this.mostProfitableSource.next(cyclesFiltered);
  }

  // TODO: Consider refactoring
  /**
   * Extracts the token names from the edge name
   */
  private enrichCycles(cycles: SingleArbitrague[][]): SingleArbitrague[][] {
    return cycles.map((trades) =>
      trades.map((trade) => {
        return {
          edge: trade.edge,
          price: trade.price,
          tokenFrom: trade.edge.split('->')[0],
          tokenTo: trade.edge.split('->')[1],
        } as SingleArbitrague;
      })
    );
  }

  // TODO: Consider refactoring
  private filterCycles(
    cycles: SingleArbitrague[][],
    icxPrice: number
  ): ArtbitraguePath[] {
    return cycles
      .filter(
        (cycle) =>
          cycle
            .map((edge) => edge.price)
            .reduce((prev, current) => prev * current) > 1
      )
      .map((cycle) => {
        return {
          cycle: cycle,
          price:
            cycle
              .map((edge) => edge.price)
              .reduce((prev, current) => prev * current) -
            cycle.length * 0.027 * icxPrice * 1.03,
        } as ArtbitraguePath;
      })
      .sort((a, b) => (a.price > b.price ? 1 : -1))
      .filter((x) => x.price > 0.99)
      .slice(-10)
      .reverse();
  }

  private findAllCyclesForNode(node: string) {
    const cycles = allSimplePaths(this.graph, node, node);
    const edges = cycles.map((x) => {
      const path = x.map((y, i) => {
        if (i + 1 < x.length) {
          const key = this.graph.edge(y, x[i + 1]);
          const price = this.graph.getEdgeAttribute(
            this.graph.edge(y, x[i + 1]),
            'price'
          ) as number;
          return { edge: key, price: price } as SingleArbitrague;
        }
      });
      path.pop();
      return path;
    });
    return edges;
  }
}
