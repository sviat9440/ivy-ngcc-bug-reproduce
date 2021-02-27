import { NgModule } from '@angular/core';
import { NumberFormatterPipe } from './number-formatter.pipe';

@NgModule({
  declarations: [
    NumberFormatterPipe,
  ],
  exports: [
    NumberFormatterPipe,
  ],
  providers: [
    NumberFormatterPipe,
  ],
})
export class NumberFormatterPipeModule {
}
