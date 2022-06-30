import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edgeGroomingPipe',
})
export class EdgeGroomingPipePipe implements PipeTransform {
  transform(edge: string): string {
    return edge.split('->')[0];
  }
}
