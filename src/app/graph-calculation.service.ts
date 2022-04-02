import { Injectable } from '@angular/core';
import Graph from 'graphology';
import { dfs } from 'graphology-traversal/dfs';
import { allSimplePaths } from 'graphology-simple-path';
import { Attributes } from 'graphology-types';
import { IPoolStats } from './pool-stats-req-params';

type NodeType = { name: string };

@Injectable({
  providedIn: 'root',
})
export class GraphCalculationService {
  constructor() {}
  graph = new Graph();

  initGraph(pools: Array<IPoolStats>) {
    console.log(pools);
    // this.graph.addNode('sICX');
    // this.graph.addNode('BALN');
    // this.graph.addNode('bnUSD');
    // this.graph.addNode('IUSDC');
    // // sICX/BALN
    // this.graph.addDirectedEdgeWithKey('sICX->BALN', 'sICX', 'BALN', {
    //   price: 0.96,
    // });
    // this.graph.addDirectedEdgeWithKey('BALN->sICX', 'BALN', 'sICX', {
    //   price: 1.04,
    // });
    // // bnUSD/sICX
    // this.graph.addDirectedEdgeWithKey('sICX->bnUSD', 'sICX', 'bnUSD', {
    //   price: 0.74,
    // });
    // this.graph.addDirectedEdgeWithKey('bnUSD->sICX', 'bnUSD', 'sICX', {
    //   price: 1.32,
    // });
    // // bnUSD/BALN
    // this.graph.addDirectedEdgeWithKey('BALN->bnUSD', 'BALN', 'bnUSD', {
    //   price: 0.77,
    // });
    // this.graph.addDirectedEdgeWithKey('bnUSD->BALN', 'bnUSD', 'BALN', {
    //   price: 1.28,
    // });
    // // bnUSD/IUSDC
    // this.graph.addDirectedEdgeWithKey('bnUSD->IUSDC', 'bnUSD', 'IUSDC', {
    //   price: 1.04,
    // });
    // this.graph.addDirectedEdgeWithKey('IUSDC->bnUSD', 'IUSDC', 'bnUSD', {
    //   price: 1.28,
    // });

    // this.graph.addDirectedEdgeWithKey('IUSDC->sICX', 'IUSDC', 'sICX', {
    //   price: 1.26,
    // });
    // this.graph.addDirectedEdgeWithKey('sICX->IUSDC', 'sICX', 'IUSDC', {
    //   price: 0.77,
    // });
    // console.log(this.graph.size);
    // console.log(this.graph.toJSON());
    //this.findAllCyclesForNode('sICX');
  }

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
    console.log(edges);
  }
}
