import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';


export function hexToDouble(numberInHex: string, decimal: number = 0) {
  const resTemp =
    parseInt(numberInHex.substring(2), 16) / Math.pow(10, decimal);
  const resTemp1 = resTemp > 100000000 ? resTemp / Math.pow(10, 12) : resTemp;
  const res = resTemp1 > 100000000 ? resTemp1 / Math.pow(10, 12) : resTemp1;
  return res;
}



function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

function inputIsNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input !== null && input !== undefined && !isEmpty(input);
}
export function isNotNullOrUndefined<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(
      filter(inputIsNotNullOrUndefined)
    );
}
