import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { GestureController, Gesture } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-mini-audio-player',
  templateUrl: './mini-audio-player.component.html',
  styleUrls: ['./mini-audio-player.component.scss'],
})
export class MiniAudioPlayerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() public message!: Message | null;
  @Output() public closing: EventEmitter<any> = new EventEmitter();
  @Output() public finish: EventEmitter<any> = new EventEmitter();
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLElement>;

  close: boolean = false;

  private swipeGesture: Gesture | undefined;

  audioUrl!: string | undefined;;

  constructor(public core: CoreProvider, private gestureCtrl: GestureController, private restService: RestService) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.audioUrl = undefined;
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

  getaudioFromServer() {
    if(this.message) {
      this.restService.downloadAudioFile(this.message).subscribe({
        next: (response: Blob) => {
          // Convertimos el blob en una URL para el elemento de audio
          this.audioUrl = URL.createObjectURL(response);
        },
        error: (error) => {
          console.error('Error al recibir el archivo de audio:', error);
        }
      })
    }
  }

  endedAudio() {
    this.finish.emit();
  }
}
