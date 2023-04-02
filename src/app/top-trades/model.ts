/**
 * The sequence of the arbitragues to be executed
 * The price is the cumulated gain
 */
export interface ArtbitraguePath {
  cycle: SingleArbitrague[];
  price: number;
}
/**
 * Represents the single Arbitrague/Trade from one token to another
 */
export interface SingleArbitrague {
  edge: string;
  price: number;
  tokenFrom: string;
  tokenTo: string;
  tokenFromContract: string;
  tokenToContract: string;
}
