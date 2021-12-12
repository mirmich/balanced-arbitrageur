export interface IPoolStatsReqParams {
  to: string;
  dataType: string;
  data: {
    method: string;
    params: {
      _id: string;
    };
  };
}

export interface IPoolStatsReq {
  jsonrpc: string;
  id: number;
  method: string;
  params: IPoolStatsReqParams;
}
