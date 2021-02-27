import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'numberFormatter',
})
export class NumberFormatterPipe implements PipeTransform {
  transform(
    value: number | string = 0,
  ): string {
    return value.toString();
  }
}
