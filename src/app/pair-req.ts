import { IPairReqParams } from './pair-req-params';

export interface IPairReq {
  jsonrpc: string;
  id: number;
  method: string;
  params: IPairReqParams;
}

export interface IAssetBalance {
  id: number;
  jsonrpc: string;
  result: string;
}
