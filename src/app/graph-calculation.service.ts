import { Injectable } from '@angular/core';
import Graph from 'graphology';
import {dfs} from 'graphology-traversal/dfs';

type NodeType = { name: string };

@Injectable({
  providedIn: 'root',
})
export class GraphCalculationService {
  constructor() {}

  initGraph() {
    const graph = new Graph();
    graph.addNode('sICX');
    graph.addNode('BALN');
    graph.addNode('bnUSD');
    graph.addNode('IUSDC');
    // sICX/BALN
    graph.addDirectedEdgeWithKey('sICX->BALN', 'sICX', 'BALN', { price: 0.96 });
    graph.addDirectedEdgeWithKey('BALN->sICX', 'BALN', 'sICX', { price: 1.04 });
    // bnUSD/sICX
    graph.addDirectedEdgeWithKey('sICX->bnUSD', 'sICX', 'bnUSD', { price: 0.74 });
    graph.addDirectedEdgeWithKey('bnUSD->sICX', 'bnUSD', 'sICX', { price: 1.32 });
    // bnUSD/BALN
    graph.addDirectedEdgeWithKey('BALN->bnUSD', 'BALN', 'bnUSD', { price: 0.77 });
    graph.addDirectedEdgeWithKey('bnUSD->BALN', 'bnUSD', 'BALN', { price: 1.28 });
    // bnUSD/IUSDC
    graph.addDirectedEdgeWithKey('bnUSD->IUSDC', 'bnUSD', 'IUSDC', { price: 1.04 });
    graph.addDirectedEdgeWithKey('IUSDC->bnUSD', 'IUSDC', 'bnUSD', { price: 1.28 });

    graph.addDirectedEdgeWithKey('IUSDC->sICX', 'IUSDC', 'sICX', { price: 1.26 });
    graph.addDirectedEdgeWithKey('sICX->IUSDC', 'sICX', 'IUSDC', { price: 0.77 });
    console.log(graph.size);
    console.log(graph.toJSON());
    dfs(graph, function (node, attr, depth) {
      console.log(node, attr, depth);
    });
    // const graph = new Graph<NodeType>((n: NodeType) => n.name);
    // graph.insert({ name: 'sICX' });
    // console.log(graph.getNodes());
  }
}