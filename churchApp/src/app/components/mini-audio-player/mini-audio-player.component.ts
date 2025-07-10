import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, output, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { GestureController, Gesture } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';
import * as Constants from 'src/app/constants'
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
  @ViewChild('audio') audioElement?: ElementRef<HTMLAudioElement>; 


  close: boolean = false;

  private swipeGesture: Gesture | undefined;
  
  audioUrl!: string | undefined;
  // nueva forma de event emitter angular 17
  swipeUpEvent = output<boolean>();
  onTapEvent = output<boolean>();
  audioDuration!: any;
  progress!: any;


  navigationExtra: NavigationExtras = {};

  constructor(
    public core: CoreProvider,
    private gestureCtrl: GestureController,
    private restService: RestService,
    private router: Router
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.audioUrl = undefined;
      if (this.message) {
        // comprobamos si el msg seleccionado es el que tenemos en el storage
        let localStorageMsg = localStorage.getItem(Constants.AUDIO_FILE_ID)
        if((localStorageMsg && parseInt(localStorageMsg) != this.message.id) || typeof localStorageMsg === 'undefined') {
          
          // this.getaudioFromServer().then(() => {
          //   if (this.audioPlayer) {
          //     this.initializeSwipeGesture();
          //   }
          // }).catch(err => { console.log(err) })
        }
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
    // if (this.audioPlayer) {
    //   this.initializeSwipeGesture();
    // }
    console.log('this.audioPlayer = ', this.audioElement)
    this.getaudioFromServer().then(() => {
      if (this.audioPlayer) {
        this.initializeSwipeGesture();
      }
    }).catch(err => { console.log(err) })
  }

  initializeSwipeGesture() {
    // Configure swipe down gesture
    this.swipeGesture = this.gestureCtrl.create({
      el: this.audioPlayer.nativeElement,
      gestureName: 'swipe-down',
      direction: 'y', // Detect vertical movement
      onMove: (ev) => {
        if (ev.deltaY > 30 && !this.close) { //DeltaY value indicates the Y displacement
          console.log('IF')
          this.close = true
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
    setTimeout(() => {
      this.closing.emit();
    }, 700); //This time must match with the "disappearAudioPlayerAnimation" time
  }

  getaudioFromServer(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if(this.message) {
        // this.restService.downloadAudioFile(this.message).subscribe({
        //   next: (response: Blob) => {
        //     // Convertimos el blob en una URL para el elemento de audio
        //     this.audioUrl = URL.createObjectURL(response);
        //     localStorage.setItem(Constants.AUDIO_FILE_CONTENT, this.audioUrl)
            
        //     resolve(true)
        //   },
        //   error: (error) => {
        //     console.error('Error al recibir el archivo de audio:', error);
        //     reject(error)
        //   }
        // })


        /* nueva propuesta con fetch */
        try {
          // 🔹 Construimos la URL para descargar el audio
          const url = `${environment.url}/audioFiles?url=${this.message.url}&title=${this.message.title}&mimetype=${this.message.mimetype}`;
      
          // 🚀 Usamos fetch para descargar en streaming
          const response = await fetch(url, {
            headers: { 'Accept': 'audio/mpeg' },
          });
      
          if (!response.body) {
            throw new Error('El servidor no retornó un cuerpo de respuesta');
          }
          this.audioDuration = parseFloat(''+response.headers.get('X-Audio-Duration')) ? response.headers.get('X-Audio-Duration') : '0.0'
          console.log('Header => ', this.audioDuration)
      
          this.playAudioStream(response.body);
        } catch (error) {
          console.error('Error al recibir el archivo de audio:', error);
        }

      } else {
        reject({error: 'No hay mensaje seleecionado'})
      }

    })
  }

  playAudioStream(stream: ReadableStream<Uint8Array>) {
    if (!this.audioElement?.nativeElement) {
      console.error('No se pudo acceder al elemento de audio.');
      return;
    }
    const audioElement = this.audioElement.nativeElement;
    // const audioElement = document.querySelector('audio') as HTMLAudioElement;
    const mediaSource = new MediaSource();
  
    audioElement.src = URL.createObjectURL(mediaSource);
  
    mediaSource.addEventListener('sourceopen', async () => {
      const mimeType = `audio/mpeg`; // Asegúrate de que el MIME es correcto
      const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
  
      const reader = stream.getReader();
  
      // Procesamos el audio mientras se descarga
      const processChunk = async () => {
        const { done, value } = await reader.read();
        if (done) {
          mediaSource.endOfStream();

          // Esperar un poco para que el navegador actualice la duración
      setTimeout(() => {
        if (!isNaN(audioElement.duration)) {
          console.log('Duración total:', parseFloat(this.audioDuration));
        } else {
          console.warn('No se pudo determinar la duración del audio.');
        }
      }, 3000); // Pequeño retraso para que se cargue bien la metadata
          return;
        }
  
        sourceBuffer.appendBuffer(value);
        sourceBuffer.addEventListener('updateend', processChunk, { once: true });
      };
  
      await processChunk();

      audioElement.onloadedmetadata = () => {
        console.log('Metadata cargada. Duración:', audioElement.duration);
      };
    
      audioElement.ontimeupdate = () => {
        const progress = (audioElement.currentTime / parseFloat(this.audioDuration)) * 100;
        this.progress = progress
        // console.log(`Progreso: ${progress.toFixed(2)}%`);
      };

      audioElement.play().catch(err => console.error('Error al reproducir:', err));
    });
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
