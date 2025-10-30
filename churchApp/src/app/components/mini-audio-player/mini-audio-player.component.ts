import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, output, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { GestureController, Gesture } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-mini-audio-player',
  templateUrl: './mini-audio-player.component.html',
  styleUrls: ['./mini-audio-player.component.scss'],
})
export class MiniAudioPlayerComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() public message!: Message | null;
  @Output() public closing: EventEmitter<any> = new EventEmitter();
  @Output() public finish: EventEmitter<any> = new EventEmitter();
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLElement>;
  @ViewChild('audio') audioElement!: ElementRef<HTMLAudioElement>; 

  close: boolean = false;

  private swipeGesture: Gesture | undefined;
  
  audioUrl!: string | undefined;
  // nueva forma de event emitter angular 17
  swipeUpEvent = output<boolean>();
  onTapEvent = output<boolean>();
  audioDuration!: any;
  progress: number = 0;
  startPlaying: boolean = false;

  navigationExtra: NavigationExtras = {};

  constructor(
    public core: CoreProvider,
    private gestureCtrl: GestureController,
    private router: Router
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.startPlaying = false;
      if (this.message) {
        this.getaudioFromServer()
      }
    }
  }

  ngOnDestroy(): void {
    // Liberar la URL generada para evitar fugas de memoria
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
  }

  ngAfterViewInit() {
    this.getaudioFromServer();
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
          this.close = true;
          this.closeAudioPlayer();
        } else if (ev.deltaY < -30) {
          this.openMsgDetail(ev);
        }
      }
    });

    this.swipeGesture.enable(true); // Actives the gesture
  }

  closeAudioPlayer() {
    this.audioPlayer.nativeElement.classList.remove("appearAudioPlayer");
    this.audioPlayer.nativeElement.classList.add("disappearAudioPlayer");
    // ng changes
    setTimeout(() => {
      this.closing.emit();
    }, 800); //This time must match with the "disappearAudioPlayerAnimation" time
  }

  getaudioFromServer(): void {
    if(this.message && this.audioElement) {
      const url = `${environment.url}/audioFiles?url=${this.message.url}&title=${this.message.title}&mimetype=${this.message.mimetype}`;
      
      this.audioElement.nativeElement.src = url
    }
  }

  onAudioPlaying() {
      this.startPlaying = true;
  }

  tapEvent() {
    if(this.audioUrl) {
      this.onTapEvent.emit(true)
    }
  }

  endedAudio() {
    this.finish.emit();
  }

  openMsgDetail(event: any) {
    // event.preventDefault();
    // event.stopPropagation();
    
    this.navigationExtra.queryParams = this.message;
    this.router.navigate(['message-detail'], this.navigationExtra)
  }
}
