import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'ui-count-to',
  template: '',
})
export class UiCountToTestingComponent {
  @Input() public uiCountTo: number;
  @Input() public uiCountFrom: number;
  @Input() public uiCountDuration;
  @Input() public uiCountStep;
}
