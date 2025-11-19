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

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.core.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.core.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.core.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  searchInput() {
    this.result = this.core.findInBible(this.searchedTerm, this.includeAT, this.includeNT);
    console.log(this.result);
    
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
      componentProps: { verse },
      cssClass: 'versesPopover',
      backdropDismiss: true,
      showBackdrop: true,
      enterAnimation: this.enterAnimation,
      leaveAnimation: this.leaveAnimation,
    });

    modal.present()
  }
}
