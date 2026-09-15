import { Component, OnInit } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-worship',
  templateUrl: './worship.page.html',
  styleUrls: ['./worship.page.scss'],
})
export class WorshipPage implements OnInit {

  constructor(public core: CoreProvider) { }

  ngOnInit() {
  }

  goBack() {
    this.core.navCtrl.pop();
  }
}
