import { Component, Input } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-show-verses',
  templateUrl: './show-verses.component.html',
  styleUrls: ['./show-verses.component.scss'],
})
export class ShowVersesComponent {

  @Input() public verse: string | undefined;

  constructor(public core: CoreProvider) { }

}
