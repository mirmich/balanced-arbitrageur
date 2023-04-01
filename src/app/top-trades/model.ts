export interface ArtbitraguePath {
  cycle: SingleArbitrague[];
  price: number;
}

export interface SingleArbitrague {
  edge: string;
  price: number;
  tokenFrom: string;
  tokenTo: string;
}
