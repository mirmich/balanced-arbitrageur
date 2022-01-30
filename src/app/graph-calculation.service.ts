import { Injectable } from '@angular/core';
import Graph from 'graphology';

type NodeType = { name: string };

@Injectable({
  providedIn: 'root',
})
export class GraphCalculationService {
  constructor() {}

  initGraph() {
    const graph = new Graph();
    graph.addNode('sICX');
    graph.addNode('bnUSD');

    // const graph = new Graph<NodeType>((n: NodeType) => n.name);
    // graph.insert({ name: 'sICX' });
    // console.log(graph.getNodes());
  }
}
