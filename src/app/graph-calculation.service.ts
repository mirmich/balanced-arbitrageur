import { Injectable } from '@angular/core';
import Graph from 'graphology';
import { dfs } from 'graphology-traversal/dfs';
import { allSimpleEdgePaths, allSimplePaths } from 'graphology-simple-path';
import { Attributes } from 'graphology-types';
import { IPoolStats } from './pool-stats-req-params';

type NodeType = { name: string };

@Injectable({
  providedIn: 'root',
})
export class GraphCalculationService {
  constructor() {}
  graph = new Graph();

  initGraph(pools: Array<IPoolStats>, icxPriceInBnUSD: number) {
    //console.log(pools.map((x) => x.result.price + ' ' + x.result.name));
    const blackListedPools: Array<string> = Array(
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
      'USDS/IUSDC'
    );
    pools
      .filter((pool) => !(blackListedPools.indexOf(pool.result.name) > -1))
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
    //console.log(this.graph.toJSON());
    const cycles = this.findAllCyclesForNode('bnUSD');

    const resultFiltered = cycles
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
            cycle.length * 0.027 * icxPriceInBnUSD * 1.03,
        };
      })
      .sort((a, b) => (a.price > b.price ? 1 : -1))
      .filter((x) => x.price > 0.94);
    console.log(resultFiltered);
  }
  // every trade 0.3
  findAllCyclesForNode(node: string) {
    const cycles = allSimplePaths(this.graph, node, node);
    const edges = cycles.map((x) => {
      const path = x.map((y, i) => {
        if (i + 1 < x.length) {
          const key = this.graph.edge(y, x[i + 1]);
          const price = this.graph.getEdgeAttribute(
            this.graph.edge(y, x[i + 1]),
            'price'
          );
          return { edge: key, price: price };
        }
      });
      path.pop();
      return path;
    });
    return edges;
  }
}
