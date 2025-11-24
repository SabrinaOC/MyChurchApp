import { Component, OnInit } from '@angular/core';
import { ShowVersesComponent } from 'src/app/components/show-verses/show-verses.component';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-bible-reference',
  templateUrl: './bible-reference.page.html',
  styleUrls: ['./bible-reference.page.scss'],
})
export class BibleReferencePage implements OnInit {

  searchedTerm: string = ""
  includeNT: boolean = true;
  includeAT: boolean = true;

  result: any[] = [];
  results: number = 0;

  constructor(
    public core: CoreProvider
  ) { }

  ngOnInit() {
    console.log("Hi!");
    
  }

  searchInput() {
    this.result = this.core.bible.findInBible(this.searchedTerm, this.includeAT, this.includeNT);
  }

  changedSearchBar(e: any) {
    this.searchedTerm = e.target.value;
    this.searchInput();
  }

  toggleOldTestament(e: any) {    
    this.includeAT = e.detail.checked;
    this.searchInput();
  }

  toggleNewTestament(e: any) {
    this.includeNT = e.detail.checked;
    this.searchInput();
  }

  async openShowVerses(verse: string) {
    const modal = await this.core.modalCtrl.create({
      component: ShowVersesComponent,
      componentProps: { verse, searchedTerm: this.searchedTerm },
      cssClass: 'versesPopover',
      backdropDismiss: true,
      showBackdrop: true,
      enterAnimation: this.core.enterShowVersesAnimation,
      leaveAnimation: this.core.leaveShowVersesAnimation,
    });

    modal.present()
  }
}
