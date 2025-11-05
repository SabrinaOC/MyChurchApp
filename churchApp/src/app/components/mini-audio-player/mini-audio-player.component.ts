import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, output, Output, ViewChild } from '@angular/core';
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
export class MiniAudioPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
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

  navigationExtra: NavigationExtras = {};

  isPlaying: boolean = false;
  progress: number = 0;
  duration: number = 0;
  isLoading: boolean = false;

  constructor(
    public core: CoreProvider,
    private gestureCtrl: GestureController,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.core.audio.isPlaying$.subscribe(v => this.isPlaying = v);
    this.core.audio.progress$.subscribe(v => this.progress = v);
    this.core.audio.duration$.subscribe(v => this.duration = v);
    this.core.audio.isLoading$.subscribe(v => this.isLoading = v);
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

  onSeek(event: any) {
    const value = event.detail.value;
    this.core.audio.seekTo(value);
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

  tapEvent() {
    if(this.audioUrl) {
      this.onTapEvent.emit(true)
    }
  }

  endedAudio() {
    this.finish.emit();
  }

  togglePlay() {
    console.log(this.isPlaying);
    
    if (this.isPlaying) this.core.audio.pause();
    else this.core.audio.play();
  }

  openMsgDetail(event: any) {
    // event.preventDefault();
    // event.stopPropagation();
    
    this.navigationExtra.queryParams = this.message;
    this.router.navigate(['message-detail'], this.navigationExtra)
  }
}
