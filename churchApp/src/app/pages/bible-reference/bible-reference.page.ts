import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonAccordionGroup, IonCheckbox, IonContent, IonSearchbar } from '@ionic/angular';
import { ShowVersesComponent } from 'src/app/components/show-verses/show-verses.component';
import { VerseObject } from 'src/app/services/bible.service';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-bible-reference',
  templateUrl: './bible-reference.page.html',
  styleUrls: ['./bible-reference.page.scss'],
})
export class BibleReferencePage implements  OnInit, AfterViewInit {

  @ViewChild('searchbar', { static: true }) searchbar!: IonSearchbar;
  @ViewChild('chkOldTestament', { static: true }) chkOldTestament!: IonCheckbox;
  @ViewChild('chkNewTestament', { static: true }) chkNewTestament!: IonCheckbox;
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  @ViewChildren(IonContent) contents!: QueryList<IonContent>;
  content!: IonContent;

  showScroller = false;

  searchedTerm: string = ""
  includeNT: boolean = true;
  includeAT: boolean = true;

  groupedVerses = new Map<string, Array<VerseObject>>();
  verseCount: number = 0;

  constructor(
    public core: CoreProvider
  ) { }

  ngOnInit() {
    // Get before search state
    this.searchedTerm = this.core.bible.lastSearchTerm;
    this.searchbar.value = this.searchedTerm;

    this.includeAT = this.core.bible.lastIncludeOT;
    this.chkOldTestament.checked = this.includeAT;

    this.includeNT = this.core.bible.lastIncludeNT;
    this.chkNewTestament.checked = this.includeNT;

    this.groupedVerses = this.core.bible.lastGroupedVerses;
    this.verseCount = this.core.bible.lastVerseCount;
  }

  ngAfterViewInit() {
    this.content = this.contents.last;
  }

  onScroll(event: any) {
    this.showScroller = event.detail.scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(500);
  }

  searchInput() {
    this.groupedVerses = new Map<string, Array<VerseObject>>();

    let result: VerseObject[] = this.core.bible.findInBible(this.searchedTerm, this.includeAT, this.includeNT);

    this.verseCount = result.length;
    
    result.forEach((verse: VerseObject) => {
      if (this.groupedVerses.has(verse.book)) {
        this.groupedVerses.get(verse.book)?.push(verse);
      } else {
        this.groupedVerses.set(verse.book, new Array(verse));
      }
    });

    if (this.verseCount) {
      this.accordionGroup.value = ["0"];
    }

    //Save search state
    this.saveStateToService();
  }

  changedSearchBar(e: any) {
    this.searchedTerm = e.target.value;
    this.searchInput();
  }

  toggleOldTestament(e: any) {
    //If New Testament is disabled, preventing disabling Old Testament
    if (!e.detail.checked && !this.includeNT) {
      this.chkOldTestament.checked = true;
      e.detail.checked = true;
      return;
    } 

    this.includeAT = e.detail.checked;
    this.searchInput();
  }

  toggleNewTestament(e: any) {
    //If Old Testament is disabled, preventing disabling New Testament
    if (!e.detail.checked && !this.includeAT) {
      this.chkNewTestament.checked = true;
      e.detail.checked = true;
      return;
    } 

    this.includeNT = e.detail.checked;
    this.searchInput();
  }

  toggleAccordionGroup(expand: boolean) {    
    this.scrollToTop()

    if (expand) {
      let i = 0;
      var array: string[] = []

      this.groupedVerses.forEach(group => {       
        array.push(i + "");
        i++;
      });

      this.accordionGroup.value = array;
    } else {
      this.accordionGroup.value = [];
    }
  }

  focusSearchbar() {
    this.searchbar.setFocus();
  }

  async openShowVerses(e: any, verse: string) {
    const modal = await this.core.modalCtrl.create({
      component: ShowVersesComponent,
      componentProps: { verse, searchedTerm: this.searchedTerm },
      cssClass: 'versesPopover',
      backdropDismiss: true,
      showBackdrop: true,
      enterAnimation: this.core.enterShowVersesAnimation,
      leaveAnimation: this.core.leaveShowVersesAnimation,
    });

    modal.onWillDismiss().then(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    await modal.present()
  }

  private saveStateToService() {
    this.core.bible.lastSearchTerm = this.searchedTerm;
    this.core.bible.lastIncludeOT = this.includeAT;
    this.core.bible.lastIncludeNT = this.includeNT;
    this.core.bible.lastGroupedVerses = this.groupedVerses;
    this.core.bible.lastVerseCount = this.verseCount;
  }
}
