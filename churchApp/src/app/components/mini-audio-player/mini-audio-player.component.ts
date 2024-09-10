import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { GestureController, Gesture } from '@ionic/angular';

@Component({
  selector: 'app-mini-audio-player',
  templateUrl: './mini-audio-player.component.html',
  styleUrls: ['./mini-audio-player.component.scss'],
})
export class MiniAudioPlayerComponent implements AfterViewInit {
  @Input() public message!: Message | null;
  @Output() public closing: EventEmitter<any> = new EventEmitter();
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLElement>;

  close: boolean = false;

  private swipeGesture: Gesture | undefined;

  constructor(public core: CoreProvider, private gestureCtrl: GestureController) { }

  ngAfterViewInit() {
    if (this.audioPlayer) {
      this.initializeSwipeGesture();
    }
  }

  initializeSwipeGesture() {
    // Configure swipe down gesture
    this.swipeGesture = this.gestureCtrl.create({
      el: this.audioPlayer.nativeElement,
      gestureName: 'swipe-down',
      direction: 'y', // Detect vertical movement
      onMove: (ev) => {
        if (ev.deltaY > 30 && !this.close) { //DeltaY value indicates the Y displacement
          this.close = true
          this.closeAudioPlayer();
        }
      }
    });

    this.swipeGesture.enable(true); // Actives the gesture
  }

  closeAudioPlayer() {
    this.audioPlayer.nativeElement.classList.remove("appearAudioPlayer");
    this.audioPlayer.nativeElement.classList.add("disappearAudioPlayer");
    setTimeout(() => {
      this.closing.emit();
    }, 700); //This time must match with the "disappearAudioPlayerAnimation" time
  }


}
