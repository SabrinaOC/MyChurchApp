import { Component, OnInit } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-bible-reader-page',
  templateUrl: './bible-reader.page.html',
  styleUrls: ['./bible-reader.page.scss'],
})
export class BibleReaderPage implements OnInit {

  constructor(public core: CoreProvider) { }

  ngOnInit() {
  }

}
