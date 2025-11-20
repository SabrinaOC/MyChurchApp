import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { GestureController, Gesture } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-mini-audio-player',
  templateUrl: './mini-audio-player.component.html',
  styleUrls: ['./mini-audio-player.component.scss'],
})
export class MiniAudioPlayerComponent implements OnInit, AfterViewInit {
  @Input() public message!: Message | null;
  @Output() public closing: EventEmitter<any> = new EventEmitter();
  @Output() public finish: EventEmitter<any> = new EventEmitter();
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLElement>;
  @ViewChild('audio') audioElement!: ElementRef<HTMLAudioElement>; 

  close: boolean = false;

  private swipeGesture: Gesture | undefined;


  navigationExtra: NavigationExtras = {};

  isPlaying: boolean = false;
  progress: number = 0;
  duration: number = 0;
  isLoading: boolean = false;

  constructor(
    public core: CoreProvider,
    private gestureCtrl: GestureController,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.core.audio.isPlaying$.subscribe(v => this.isPlaying = v);
    this.core.audio.progress$.subscribe(v => this.progress = v);
    this.core.audio.duration$.subscribe(v => this.duration = v);
    this.core.audio.isLoading$.subscribe(v => this.isLoading = v);
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
          this.ngZone.run(() => {
            this.openMsgDetail(ev);
          });
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
