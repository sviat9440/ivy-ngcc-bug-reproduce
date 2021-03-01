import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NumberFormatterTestingPipeModule } from '@front-polis/ui-pipes/testing';
import { CountoModule } from 'angular2-counto';
import { TestNamespace } from '@front-polis/ui-pipes';
import { UiCountToComponent } from './ui-count-to.component';

// mod does not exists
console.log(TestNamespace.TestModule['ɵmod']);

describe('UiCountToComponent', () => {
  let fixture: ComponentFixture<UiCountToComponent>;
  let component: UiCountToComponent;

  beforeEach(async(() => TestBed.configureTestingModule({
    declarations: [
      UiCountToComponent,
    ],
    imports: [
      TestNamespace.TestModule,
      NumberFormatterTestingPipeModule,
      CountoModule,
    ],
  }).compileComponents()));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiCountToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('должен быть создан', () => {
    expect(component).toBeTruthy();
  });
});

