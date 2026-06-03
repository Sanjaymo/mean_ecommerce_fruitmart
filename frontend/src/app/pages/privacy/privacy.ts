import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LEGAL_POLICY } from '../../config/legal';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacy {
  readonly legalLastUpdated = LEGAL_POLICY.lastUpdatedLabel;
}

