import {
  Component,
  NgModule,
} from '@angular/core';

export namespace TestNamespace {
  @Component({
    selector: 'ui-component',
    template: '',
  })
  export class TestComponent {
  }

  @NgModule({
    declarations: [
      TestComponent,
    ],
    exports: [
      TestComponent,
    ],
  })
  export class TestModule {
  }
}
