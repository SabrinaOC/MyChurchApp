import { Component, OnInit } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-bible-reference',
  templateUrl: './bible-reference.page.html',
  styleUrls: ['./bible-reference.page.scss'],
})
export class BibleReferencePage implements OnInit {

  constructor(
    public core: CoreProvider
  ) { }

  ngOnInit() {
    console.log("Hi!");
    
  }

}
