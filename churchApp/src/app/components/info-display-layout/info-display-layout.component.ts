import { Component, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';

export type InfoLayout = 
  | 'FindABibleTerm' 
  | 'NoResultsFound' 
  | 'WriteAtLeastThreeWords' 
  | 'NoInternetConnection';

@Component({
  selector: 'app-info-display-layout',
  templateUrl: './info-display-layout.component.html',
  styleUrls: ['./info-display-layout.component.scss'],
})
export class InfoDisplayLayoutComponent implements OnInit, OnDestroy {

  infoLayout = input<InfoLayout>();
  actionClicked = output<void>();

  isKeyboardOpen = signal<boolean>(false);

  constructor() { }

  ngOnInit() {
    // Listen when de keyboard will show
    Keyboard.addListener('keyboardWillShow', () => {
      this.isKeyboardOpen.set(true);
    });

    //  Listen when de keyboard will hide
    Keyboard.addListener('keyboardWillHide', () => {
      this.isKeyboardOpen.set(false);
    });
  }

  ngOnDestroy() {
    Keyboard.removeAllListeners();
  }

}
