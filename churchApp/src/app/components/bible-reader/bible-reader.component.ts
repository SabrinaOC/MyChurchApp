import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';
import { SimpleVerseSelectorComponent } from '../simple-verse-selector/simple-verse-selector.component';
import { IonContent } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bible-reader',
  templateUrl: './bible-reader.component.html',
  styleUrls: ['./bible-reader.component.scss'],
})
export class BibleReaderComponent implements AfterViewInit {

  @ViewChild("chapterBadge") chapterBadge!: ElementRef<HTMLElement>;
  @ViewChildren(IonContent) contents!: QueryList<IonContent>;
  content!: IonContent;

  private _verse: string | undefined;

  @Input()
  set verse(value: string | undefined) {
    if (this._verse && this._verse.includes(':') && value === this.chapter) {
      if (value && !value.includes(':')) {
        return; 
      }
    }
    
    this._verse = value;
    if (value) {
      this.setText(value);
    }
  }
  get verse() {
    return this._verse;
  }

  @Input() public asPage: boolean = false;

  text: string = "";
  book: string = "";
  chapter: string = "";
  chapterNumber: string = "";

  constructor(public core: CoreProvider, private cdRef: ChangeDetectorRef, public router: Router) { }

  ngAfterViewInit() {    
    this.content = this.contents.last;
  }


  setText(verse: string) {
    const { book, chapter, verseStart, verseEnd } = this.parseVerseReference(verse);
    // console.log(book, chapter, verseStart, verseEnd);
    
    this.text = this.core.bible.getFullChapterText(book, chapter, parseInt(verseStart), parseInt(verseEnd))!;

    this.chapter = `${book} ${chapter}`;
    this.chapterNumber = chapter;
    this.book = book;
    //If the component is opened as page, save chapter
    if (this.asPage) {      
      this.core.bible.lastChapterRead = this.chapter;
      localStorage.setItem("lastChapterRead", this.core.bible.lastChapterRead);
    }

    // If there is a verseStart, we'll navigate to find it easily
    if (verseStart) {
      setTimeout(async () => {
        const elements = document.getElementsByClassName("underlineVerse");

        if (elements.length > 0) {
          const element = elements[0];
          const domRect = element.getBoundingClientRect();
          
          // Get the native scroll element
          const scrollElement = await this.content.getScrollElement();          
          // Calc the absolute Y position
          const absoluteY = scrollElement.scrollTop + domRect.y;
          // Calc offset to center it on the screen
          const centerOffset = window.innerHeight / 2;
          
          this.content.scrollToPoint(0, absoluteY - centerOffset + 120, 500);
        }
      }, 500);
    } else {
      if (this.content) {        
        this.content.scrollToTop(500);
      }
    }

    this.badgeAnimation();
  }


  parseVerseReference(ref: string) {
    const regex = /^(\d?\s?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;

    const match = ref.trim().match(regex);
    
    if (!match) {
      throw new Error("Referencia bíblica inválida: " + ref);
    }

    return {
      book: match[1].trim(),
      chapter: match[2],
      verseStart: match[3],
      verseEnd: match[4] ?? match[3]
    };
  }

  async showSimpleVerseSelector(e: any) {
    const popover = await this.core.popoverCtrl.create({
      component: SimpleVerseSelectorComponent,
      translucent: true,
      cssClass: 'verse-selector-popover',
      event: e,
      alignment: 'center',
      side: 'top',
      componentProps: {justVerse: true},
      arrow: false
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      this.verse = data;
    }

  }

  getAdjacentChapter(direction: 'next' | 'prev' = 'next') {
    const splitIndex = this.verse?.search(/\s\d/);

    const verse = this.core.bible.getAdjacentChapter(this.verse?.substring(0, splitIndex)!, parseInt(this.verse?.substring(splitIndex!, this.verse.length)!), direction); 
    
    if (verse) this.verse = verse;
  }

  badgeAnimation() {
    if (this.chapterBadge) {
      this.chapterBadge.nativeElement?.classList.add("zoomInOutElement");
  
      setTimeout(() => {
        this.chapterBadge.nativeElement?.classList.remove("zoomInOutElement");
      }, 800);
    }    
  }
  
  closeAudioPlayer() {
    this.core.audio.selectMessage(null);
    this.cdRef.detectChanges(); //Force detecting changes
  }

  markAsListenedMessage(event: any) {
    event.preventDefault();
    this.core.audio.markAsListened(this.core.audio.selectedMessage!, event);
  }
}
