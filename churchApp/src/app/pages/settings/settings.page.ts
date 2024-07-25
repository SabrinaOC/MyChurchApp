import { Component, OnInit } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(public core: CoreProvider) { }

  ngOnInit() {
  }

}
