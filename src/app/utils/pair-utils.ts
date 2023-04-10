import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IPoolStats } from '../pool-stats-req-params';

export function priceImpact(pool: IPoolStats, value: number): number {
  if (pool.result.name == 'sICX/ICX') {
    return hexToDouble(
      pool.result.price,
      parseInt(pool.result.base_decimals.substring(2), 16)
    );
  } else {
    const tokenALiq = hexToDecimalWithPrecision(
      pool.result.base,
      pool.result.base_decimals
    );
    const tokenBLiq = hexToDecimalWithPrecision(
      pool.result.quote,
      pool.result.quote_decimals
    );
    const poolFactor = tokenALiq * tokenBLiq;
    return tokenBLiq - poolFactor / (value + tokenALiq);
  }
}

export function hexToDecimalWithPrecision(
  value: string,
  decimals: string
): number {
  const parsed =
    parseInt(value, 16) / Number('1E' + parseInt(decimals, 16).toString());
  const adjusted = parsed > 100000000 ? parsed / Math.pow(10, 12) : parsed;
  const adjustedAgain =
    adjusted > 100000000 ? adjusted / Math.pow(10, 12) : adjusted;
  return adjustedAgain;
}

export function hexToDouble(numberInHex: string, decimal: number = 0) {
  const resTemp =
    parseInt(numberInHex.substring(2), 16) / Math.pow(10, decimal);
  const resTemp1 = resTemp > 100000000 ? resTemp / Math.pow(10, 12) : resTemp;
  const res = resTemp1 > 100000000 ? resTemp1 / Math.pow(10, 12) : resTemp1;
  return res;
}

export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

function inputIsNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input !== null && input !== undefined && !isEmpty(input);
}
export function isNotNullOrUndefined<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(filter(inputIsNotNullOrUndefined));
}
