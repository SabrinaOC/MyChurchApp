import { AfterViewInit, Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonAccordionGroup, IonContent } from '@ionic/angular';
import { ShowVersesComponent } from 'src/app/components/show-verses/show-verses.component';
import { VerseObject } from 'src/app/services/bible.service';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-bible-reference',
  templateUrl: './bible-reference.page.html',
  styleUrls: ['./bible-reference.page.scss'],
})
export class BibleReferencePage implements AfterViewInit {

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
