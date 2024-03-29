import { Injectable } from '@angular/core';
import Graph from 'graphology';
import { allSimplePaths } from 'graphology-simple-path';
import { Observable, Subject } from 'rxjs';
import { ArtbitraguePath, SingleArbitrague } from './top-trades/model';
import { Pool } from './pair-list/pool';

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

  public get mostProfitable(): Observable<Array<ArtbitraguePath>> {
    return this.mostProfitableArb;
  }

  public initGraph(pools: Array<Pool>) {
    pools.forEach((pool) => {
      const names = pool.name.split('/');

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
          price: pool.price,
        });
      }

      if (!this.graph.hasDirectedEdge(secondEdge)) {
        this.graph.addDirectedEdgeWithKey(secondEdge, names[1], names[0], {
          price: 1 / pool.price,
        });
      }
    });
    const cycles = this.findAllCyclesForNode('bnUSD');

    const cyclesEnriched = this.enrichCycles(cycles, pools);
    const cyclesFiltered = this.filterCycles(cyclesEnriched);
    this.mostProfitableSource.next(cyclesFiltered);
  }

  // TODO: Consider refactoring
  /**
   * Extracts the token names from the edge name
   */
  private enrichCycles(
    cycles: SingleArbitrague[][],
    pools: Array<Pool>
  ): SingleArbitrague[][] {
    return cycles.map((trades) =>
      trades.map((trade) => {
        const tokenFromName = trade.edge.split('->')[0];
        const tokenToName = trade.edge.split('->')[1];
        const pool = pools.find(
          (x) => x.name.includes(tokenFromName) && x.name.includes(tokenToName)
        );
        const baseToken =
          pool.name.indexOf(tokenFromName) < pool.name.indexOf(tokenToName)
            ? pool.base_address
            : pool.quote_address;
        const quoteToken =
          baseToken === pool.base_address
            ? pool.quote_address
            : pool.base_address;
        return {
          edge: trade.edge,
          price: trade.price,
          tokenFrom: tokenFromName,
          tokenTo: tokenToName,
          tokenFromContract: baseToken,
          tokenToContract: quoteToken,
        } as SingleArbitrague;
      })
    );
  }

  // TODO: Consider refactoring
  private filterCycles(cycles: SingleArbitrague[][]): ArtbitraguePath[] {
    const balancedFee = 0.997;
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
          price: cycle
            .map((edge) => edge.price)
            .reduce((prev, current) => {
              console.log(prev * current);
              return prev * current * balancedFee;
            }),
          //cycle.length * transactionFee * icxPrice * balancedFee,
        } as ArtbitraguePath;
      })
      .sort((a, b) => (a.price > b.price ? 1 : -1))
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
