import { IPairReqParams } from './pair-req-params';

export interface IPairReq {
  jsonrpc: string;
  id: number;
  method: string;
  params: IPairReqParams;
}
