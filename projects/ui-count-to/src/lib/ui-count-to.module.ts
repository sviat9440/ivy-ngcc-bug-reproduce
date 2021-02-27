import { NgModule } from '@angular/core';

import { CountoModule } from 'angular2-counto';
import { NumberFormatterPipeModule } from '@front-polis/ui-pipes';
import { UiCountToComponent } from './ui-count-to.component';

const components = [
  UiCountToComponent,
];

@NgModule({
  imports: [
    CountoModule,
    NumberFormatterPipeModule,
  ],
  exports: [
    ...components,
  ],
  declarations: [
    ...components,
  ],
})

export class UiCountToModule {

}
