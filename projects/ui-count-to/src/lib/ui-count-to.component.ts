import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';

const DEFAULTS = {
  DURATION: 2,
  STEP: 10,
};

/**
 * @description компонент для отрисовки чисел с анимацией таймер/секундомер (от большего числа к меньшему и наоборот)
 */
@Component({
  selector: 'ui-count-to',
  templateUrl: './ui-count-to.component.html',
  styleUrls: ['ui-count-to.component.scss'],
})
export class UiCountToComponent implements OnInit {
  /**
   * @description число, отображаемое в начале анимации
   */
  @Input() public uiCountFrom: number;

  /**
   * @description число, отображаемое после завершения анимации
   */
  @Input() public uiCountTo: number;

  /**
   * @description (seconds) длительность анимации
   */
  @Input() public uiCountDuration = DEFAULTS.DURATION;

  /**
   * @description (milisecond) частота обновления числа
   */
  @Input() public uiCountStep = DEFAULTS.STEP;
  public currentValue = 0;
  public String = String;

  constructor(
    public changeDetector: ChangeDetectorRef,
  ) {
  }

  public ngOnInit() {
    this.currentValue = this.uiCountFrom;
  }

  public countChange(event) {
    this.currentValue = event;
    this.changeDetector.markForCheck();
  }
}
