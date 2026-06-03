import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LEGAL_POLICY } from '../../config/legal';

@Component({
  selector: 'app-terms',
  imports: [],
  templateUrl: './terms.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Terms {
  readonly legalLastUpdated = LEGAL_POLICY.lastUpdatedLabel;
}
