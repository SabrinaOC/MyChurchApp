import { Component, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

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

  private initialHeight = window.innerHeight;

  constructor() { }

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      // Listen when de keyboard will show
      Keyboard.addListener('keyboardWillShow', () => {
        this.isKeyboardOpen.set(true);
      });

      //  Listen when de keyboard will hide
      Keyboard.addListener('keyboardWillHide', () => {
        this.isKeyboardOpen.set(false);
      });
      
    } else {
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', this.handleWebResize);
      } else {
        window.addEventListener('resize', this.handleWebResize);
      }
    }
  }

  ngOnDestroy() {
    if (Capacitor.isNativePlatform()) {
      Keyboard.removeAllListeners();
    } else {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', this.handleWebResize);
      } else {
        window.removeEventListener('resize', this.handleWebResize);
      }
    }
  }

  private handleWebResize = () => {
    const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    // If the current heigth is less than 80% of initial height the keyboard has been opened
    const isKeyboardUp = currentHeight < (this.initialHeight * 0.8);
    this.isKeyboardOpen.set(isKeyboardUp);
  }
}
