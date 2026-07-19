import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonAccordionGroup, IonCheckbox, IonContent, IonSearchbar } from '@ionic/angular';
import { InfoLayout } from 'src/app/components/info-display-layout/info-display-layout.component';
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
  currentScroll: number = 0;

  searchedTerm: string = ""
  includeNT: boolean = true;
  includeAT: boolean = true;

  groupedVerses = new Map<string, Array<VerseObject>>();
  verseCount: number = 0;

  loading: HTMLIonLoadingElement | undefined;

  constructor(
    public core: CoreProvider
  ) { }

  async ngOnInit() {
    if (this.core.bible.lastSearchTerm) {
  
      this.loading = await this.core.loadingCtrl.create({
        message: 'Recuperando contenido...',
        cssClass: 'custom-loading',
        mode: 'md',
        spinner: null,
      })
      await this.loading.present();
    }

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

  async ionViewDidEnter() {
    // Restore accordionGroup
    if (this.accordionGroup && this.core.bible.lastAccordionValue) {
      this.accordionGroup.value = this.core.bible.lastAccordionValue;
    }

    // Restore scroll
    if (this.core.bible.lastScrollPosition > 0 && this.content) {
      setTimeout(() => {
        // 0ms to avoid animation
        this.content.scrollToPoint(0, this.core.bible.lastScrollPosition, 400);

      }, 50); 
    }
    
    if (this.loading) {
      this.core.loadingCtrl.dismiss();
    }
  }

  ionViewWillLeave() {
    // Save current scroll position
    this.core.bible.lastScrollPosition = this.currentScroll;
    
    // Save opened accordions
    if (this.accordionGroup) {
      this.core.bible.lastAccordionValue = this.accordionGroup.value;
    }
  }

  onScroll(event: any) {
    this.showScroller = event.detail.scrollTop > 100;
    this.currentScroll = event.detail.scrollTop;
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

    //Reset lastScrollPosition
    this.core.bible.lastScrollPosition = 0;

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

  get currentInfoLayout(): InfoLayout {
    if (!this.searchedTerm) {
      return 'FindABibleTerm';
    } else if (this.searchedTerm.length > 3) {
      return 'NoResultsFound';
    } else {
      return 'WriteAtLeastThreeWords';
    }
  }
}
