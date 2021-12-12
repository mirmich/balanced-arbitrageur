export interface IPairReqParams {
  to: string;
  dataType: string;
  data: {
    method: string;
    params: {
      _id: string;
      _token: string;
    };
  };
}
