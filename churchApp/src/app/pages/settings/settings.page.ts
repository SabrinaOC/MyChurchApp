import { Component } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  constructor(public core: CoreProvider) { }

}
