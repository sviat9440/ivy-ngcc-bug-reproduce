import { NgModule } from '@angular/core';
import { NumberFormatterPipe } from '@front-polis/ui-pipes';
import { NumberFormatterTestingPipe } from './number-formatter-testing.pipe';

@NgModule({
  declarations: [
    NumberFormatterTestingPipe,
  ],
  exports: [
    NumberFormatterTestingPipe,
  ],
  providers: [
    {
      provide: NumberFormatterPipe,
      useClass: NumberFormatterTestingPipe,
    },
  ],
})
export class NumberFormatterTestingPipeModule {
}
