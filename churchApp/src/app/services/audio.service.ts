import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { Message } from '../models/interfaces';
import * as Constants from 'src/app/constants';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CapacitorMusicControls } from 'capacitor-music-controls-plugin';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService implements OnDestroy {
  private listenedObs = new Subject<string | null>();
  listened = this.listenedObs.asObservable();

  selectedMessage: Message | null = null;

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  isPlaying$ = this.isPlayingSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  private audio = new Audio();

  // Array para gestionar la limpieza de listeners nativos manualmente
  private controlListeners: any[] = [];

  // INYECCIÓN DE NGZONE AQUÍ
  constructor(private ngZone: NgZone) {
    
    // Listeners del Audio HTML5
    this.audio.addEventListener('timeupdate', () => {
      this.progressSubject.next(this.audio.currentTime);
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audio.duration);
    });

    // Actualizamos subjects al cambiar estado
    this.audio.addEventListener('play', () => this.isPlayingSubject.next(true));
    this.audio.addEventListener('pause', () =>
      this.isPlayingSubject.next(false),
    );

    this.audio.addEventListener('waiting', () =>
      this.isLoadingSubject.next(true),
    );
    this.audio.addEventListener('playing', () =>
      this.isLoadingSubject.next(false),
    );

    this.audio.addEventListener('ended', (event) =>
      this.markAsListened(this.selectedMessage!, event),
    );

    // Ejecutar la limpieza al inicio
    if (Capacitor.isNativePlatform()) {
        setTimeout(() => {
            this.cleanupCache();
        }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.audio.src) {
      URL.revokeObjectURL(this.audio.src);
    }
    // Limpieza final de controles
    this.unregisterControlEvents();
  }

  /**
   * Función para registrar el uso del archivo
   * @param fileName
   */
  private updateFileUsage(fileName: string) {
    const now = Date.now();
    // Guardamos la última marca de tiempo de uso.
    localStorage.setItem(`file_usage_${fileName}`, now.toString());
  }

  /**
   * Metodo para descargar o cargar archivo de audio de cache
   * @returns
   */
  async loadAudio() {
    if (!this.selectedMessage) return;

    const remoteUrl = `${environment.url}/audioFiles?url=${this.selectedMessage.url}&title=${this.selectedMessage.title}&mimetype=${this.selectedMessage.mimetype}`;
    // Usamos v2 para evitar caché corrupto antiguo
    const fileName = `audio_v2_${this.selectedMessage.id}.mp3`;

    try {
      this.isLoadingSubject.next(true);

      if (Capacitor.isNativePlatform()) {
        try {
          // A) Intentar leer de caché
          await Filesystem.stat({
            path: fileName,
            directory: Directory.Cache,
          });

          //guardamos ultimo uso
          this.updateFileUsage(fileName);

          const uriResult = await Filesystem.getUri({
            path: fileName,
            directory: Directory.Cache,
          });

          // console.log('Reproduciendo desde caché local...');
          const localSrc = Capacitor.convertFileSrc(uriResult.uri);
          this.audio.src = localSrc;
        } catch (e) {
          // B) Streaming + Descarga en background
          // console.log('No en caché. Streaming...');
          this.audio.src = remoteUrl;

          this.downloadAndSaveAudio(remoteUrl, fileName)
            .then((path) => {
              // console.log('Guardado en BG:', path);
              //guardamos fecha de descarga para posterior limpieza
              this.updateFileUsage(fileName);
            })
            .catch((err) => console.error('Error guardando:', err));
        }
      } else {
        this.audio.src = remoteUrl;
      }

      this.audio.load();
      await this.audio.play();

      if (Capacitor.isNativePlatform()) {
        this.isLoadingSubject.next(false);
      }
    } catch (error) {
      console.error('Error loadAudio:', error);
      this.isLoadingSubject.next(false);
    }

    // Descomentar para mostrar this.controlListeners, aparentemente el plugin tiene errores en la gestion de eventos a partir de android 13
    // if (Capacitor.isNativePlatform()) {
    //     this.createMusicControls();
    // }
  }

  /**
   * Descarga de audio
   * @param url 
   * @param fileName 
   * @returns 
   */
  private async downloadAndSaveAudio(
    url: string,
    fileName: string,
  ): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64Data = (await this.convertBlobToBase64(blob)) as string;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    return Capacitor.convertFileSrc(savedFile.uri);
  }

  /**
   * Conversor a base64
   * @param blob 
   * @returns 
   */
  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    /**
     * Metodo para limpiar archivos de audio abiertos por ultima vez hace mas de 30 dias
     * @returns
     */
  public async cleanupCache() {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Define el umbral de tiempo (30 días en milisegundos)
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - thirtyDays;

    try {
      // 2. Obtener la lista de todos los archivos en el Directorio Cache
      const directoryContents = await Filesystem.readdir({
        path: '', // Directorio raíz de Cache
        directory: Directory.Cache,
      });

      for (const file of directoryContents.files) {
        const fileName = file.name;

        // Filtramos solo los archivos de audio
        if (fileName.startsWith('audio_v2_') && fileName.endsWith('.mp3')) {
          const usageTimeStr = localStorage.getItem(`file_usage_${fileName}`);
          const usageTime = usageTimeStr ? parseInt(usageTimeStr, 10) : 0;

          // 3. Comprobación de antigüedad
          if (usageTime === 0 || usageTime < cutoffTime) {

            // 4. ELIMINACIÓN
            await Filesystem.deleteFile({
              path: fileName,
              directory: Directory.Cache,
            });

            // Limpiar también la entrada de localStorage
            localStorage.removeItem(`file_usage_${fileName}`);
          }
        }
      }
    } catch (error) {
      console.error('Error durante la limpieza de caché:', error);
      // Nota: El error 'readdir' puede ocurrir si el directorio está vacío o hay problemas de permisos.
    }
  }

  /**
   * 
   * @param message 
   * @returns 
   */
  selectMessage(message: Message | null) {
    if (message?.id === this.selectedMessage?.id) return;

    if (message === null) {
      this.isPlayingSubject.next(false);
      this.isLoadingSubject.next(false);

      this.audio.src = '';
      this.audio.pause();
    }
    this.progressSubject.next(0);
    this.durationSubject.next(0);

    this.selectedMessage = message;
    if (this.selectedMessage?.id) {
      localStorage.setItem(
        Constants.AUDIO_FILE_ID,
        '' + this.selectedMessage.id,
      );
    }

    this.loadAudio();
  }

  /**
   * Marcar como escuchado en localStorage
   * @param message 
   * @param event 
   */
  markAsListened(message: Message, event: any) {
    event?.stopPropagation();
    //localStorage to track lilstened messages
    let listened = localStorage.getItem('listened');
    if (listened === null) {
      localStorage.setItem('listened', `${message.id}`);
    } else {
      listened += `, ${message.id}`;
      localStorage.setItem('listened', listened);
    }

    this.listenedObs.next(listened);
  }

  /**
   * 
   */
  play() {
    this.audio.play();
    if (Capacitor.isNativePlatform()) {
      CapacitorMusicControls.updateIsPlaying({ isPlaying: true });
    }
  }

  /**
   * 
   */
  pause() {
    this.audio.pause();
    if (Capacitor.isNativePlatform()) {
      CapacitorMusicControls.updateIsPlaying({ isPlaying: false });
    }
  }

  /**
   * 
   * @param seconds 
   */
  seekTo(seconds: number) {
    this.audio.currentTime = seconds;
  }

  /**
   * Pendiente de fix en plugin para controld e eventos. De momento no se esta usando pero esta todo el codigo preparado
   * @returns 
   */
  async createMusicControls() {
    if (!Capacitor.isNativePlatform()) return;

    // 1. LIMPIAR (y destruir) ANTES DE CREAR NUEVOS.
    // Llama a la limpieza de listeners antes de destruir el control nativo,
    // por si acaso el plugin hace algo al destruir que dependa de ellos.
    await this.unregisterControlEvents();
    await CapacitorMusicControls.destroy();

    // 2. CREAR NUEVOS CONTROLES (Solo si hay mensaje)
    if (!this.selectedMessage) return;

    await CapacitorMusicControls.create({
      track: this.selectedMessage?.title,
      artist: this.selectedMessage?.speaker.name,
      cover: 'assets/icon/favicon.png',
      isPlaying: true,
      dismissable: true,
      hasClose: true,
      hasPrev: false,
      hasNext: false,

      notificationIcon: 'notification',
      // playIcon: 'play_icon',
      // pauseIcon: 'pause_icon',
    });

    this.registerControlEvents();
  }

  /**
   * Helper para eliminar listeners manualmente y evitar error de TypeScript
   */
  private async unregisterControlEvents() {
    for (const listener of this.controlListeners) {
      if (listener && typeof listener.remove === 'function') {
        await listener.remove();
      }
    }
    this.controlListeners = [];
  }

  /**
   * Control de eventos plugin
   * @returns 
   */
  private async registerControlEvents() {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Limpiamos los anteriores
    await this.unregisterControlEvents();

    // ANDROID (13 bug)
    document.addEventListener('controlsNotification', (event: any) => {
      console.log('controlsNotification was fired');
      console.log(event);
      const info = { message: event.message, position: 0 };
      this.handleControlsEvent(info);
    });

    // 2. Registramos los nuevos envolviendo la lógica en NgZone.run

    const pauseListener = await CapacitorMusicControls.addListener(
      'music-controls-pause',
      () => {
        this.ngZone.run(() => {
          // console.log('Pause nativo recibido');
          this.controlListeners.push(pauseListener);
          this.pause();
        });
      },
    );

    const playListener = await CapacitorMusicControls.addListener(
      'music-controls-play',
      () => {
        this.ngZone.run(() => {
          // console.log('Play nativo recibido');
          this.play();
        });
      },
    );

    // Listener para TOGGLE (El más común en Lock Screen/Auriculares)
    const toggleListener = await CapacitorMusicControls.addListener(
      'music-controls-toggle-play-pause',
      () => {
        this.ngZone.run(() => {
          // Ejecutamos la acción que revierte el estado actual
          if (this.isPlayingSubject.getValue()) {
            this.pause(); // Llama a this.audio.pause()
          } else {
            this.play(); // Llama a this.audio.play()
          }
        });
      },
    );

    const destroyListener = await CapacitorMusicControls.addListener(
      'music-controls-destroy',
      () => {
        this.ngZone.run(() => {
          this.audio.pause();
          this.isPlayingSubject.next(false);
        });
      },
    );

    const stopListener = await CapacitorMusicControls.addListener(
      'music-controls-stop',
      () => {
        this.ngZone.run(() => {
          this.audio.pause();
          this.isPlayingSubject.next(false);
        });
      },
    );

    // 3. Guardamos referencias para poder limpiar después
    this.controlListeners.push(
      pauseListener,
      playListener,
      toggleListener,
      destroyListener,
      stopListener,
    );
  }

  /**
   * Controles transitorios por bug android 13
   * @param action 
   */
  handleControlsEvent(action: { message: any }) {
    const message = action.message;

    // console.log('message: ' + message);

    switch (message) {
      case 'music-controls-next':
        // next
        break;
      case 'music-controls-previous':
        // previous
        break;
      case 'music-controls-pause':
        this.pause();
        // paused
        break;
      case 'music-controls-play':
        this.play();
        // resumed
        break;
      case 'music-controls-destroy':
        // controls were destroyed
        this.pause();
        break;
      case 'music-controls-toggle-play-pause':
        // controls were destroyed
        console.log('toggle');
        break;

      // External controls (iOS only)
      case 'music-controls-toggle-play-pause':
        // do something
        break;
      case 'music-controls-skip-to':
        // do something
        break;
      case 'music-controls-skip-forward':
        // Do something
        break;
      case 'music-controls-skip-backward':
        // Do something
        break;

      // Headset events (Android only)
      // All media button events are listed below
      case 'music-controls-media-button':
        // Do something
        break;
      case 'music-controls-headset-unplugged':
        // Do something
        this.pause();
        break;
      case 'music-controls-headset-plugged':
        // Do something
        break;
      default:
        break;
    }
  }
}
