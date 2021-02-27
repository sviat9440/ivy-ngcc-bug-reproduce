import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'numberFormatter',
})
export class NumberFormatterTestingPipe implements PipeTransform {
  transform(
    value: number | string = 0,
    precision: number = 0,
    thousandDelimeter: string = ' ',
    decimalDelimeter: string = '.',
  ): string {
    return String(value);
  }
}
