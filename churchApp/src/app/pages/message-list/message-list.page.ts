import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Message } from '../../models/interfaces';
import { InfiniteScrollCustomEvent, IonContent, IonSearchbar } from '@ionic/angular';
import * as _ from 'lodash';
import { CoreProvider } from 'src/app/services/core';
import { NavigationExtras } from '@angular/router';
import { FilterModalComponent } from 'src/app/components/filter-modal/filter-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.page.html',
  styleUrls: ['./message-list.page.scss'],
})

export class MessageListPage implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('searchBar', { static: false }) searchBar!: IonSearchbar; 
  @ViewChildren(IonContent) contents!: QueryList<IonContent>;
  content!: IonContent;

  loadedMessages: Message[] = [];
  messageList: Message[] = [];
  isDesktop: boolean = false;
  datetime!: Date;
  rbSelected: string = 'all';
  backupListForRbFilter!: Message[];
  searchQuery: string = '';

  isOpenSharePopover: boolean = false;
  navigationExtra: NavigationExtras = {};

  showScroller = false;
  isPlaying: boolean = false;
  progress: number = 0;
  duration: number = 0;
  isLoading: boolean = false;

  limit: number = 10;
  offset: number = 0;
  hasMoreData: boolean = true

  private subscription: Subscription = new Subscription();

  constructor(
              public core: CoreProvider
  ) { }

  ngOnInit(): void {
    const sub = this.core.audio.listened.subscribe(value => {
        this.checkIfAlreadyListened(this.loadedMessages);
        this.updateListRdBtn();
    });

    this.subscription.add(sub) 
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  ngAfterViewInit() {
    this.content = this.contents.last;
  }

  async ionViewWillEnter() {
    // Load from cache if we are in "all" and not searching
    if (this.rbSelected === 'all' && !this.searchQuery && this.core.messageList && this.core.messageList.length > 0) {
      this.loadedMessages = [...this.core.messageList];
      this.offset = this.loadedMessages.length;

      this.checkIfAlreadyListened(this.loadedMessages);
      this.updateListRdBtn();

    } else if (this.loadedMessages.length === 0) {
      // If there is no cache, find all messages
      this.offset = 0;

      if (this.searchQuery === '') {
        this.getAllMessages();
      } else {
        this.findMessagesByFilter(this.searchQuery);
      }
    }
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showScroller = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(500);
  }

  searchInput(event: any) {
    const query = event.target.value?.toLowerCase().trim() || '';
    this.searchQuery = query;

    this.offset = 0; // Reiniciamos paginación al cambiar el buscador
    this.hasMoreData = true;

    if (query === '' && this.rbSelected === "all") {
      // Si borramos el buscador, restauramos la lista desde el servicio Core
      this.loadedMessages = [...this.core.messageList];
      this.offset = this.loadedMessages.length;
      this.updateListRdBtn();
    } else {
      // Si estamos buscando, vaciamos la lista actual y buscamos en BD
      this.loadedMessages = [];
      this.findMessagesByFilter(query);
    }
  }

// Se añade el parámetro opcional event
  async findMessagesByFilter(query: string, event?: any) {
    this.isLoading = true;

    let loading: HTMLIonLoadingElement | undefined;

    if (this.offset == 0 && !event) {
      loading = await this.core.loadingCtrl.create({
        message: 'Recuperando predicaciones...',
        cssClass: 'custom-loading',
        mode: 'md',
        spinner: null,
      })
      await loading.present();
    }

    const listenedIdsString = localStorage.getItem('listened') || '';

    this.core.api.message.findByFilter(
      { 
        searchedTerm: query,
        limit: this.limit,
        offset: this.offset,
        filterType: this.rbSelected,
        listenedIds: listenedIdsString
      }
    )
      .subscribe({
        next: (val: any) => {
          if (val && val.messageListMapped) {
            const newMessages = val?.messageListMapped || [];

            if (newMessages.length < this.limit) {
              this.hasMoreData = false;
            }

            this.updateMessageList(newMessages, false);
          }
          if (event) event.target.complete();
        },
        error: (e) => {
          console.error('ERROR ', e);
          if(event) event.target.complete();
        },
        complete: () => {
          if (loading) loading.dismiss();
          this.isLoading = false
        }
      });
  }
  
  scrollAndSearch(event: InfiniteScrollCustomEvent) {
    if (!this.isLoading) {
      // El scroll infinito decide automáticamente qué endpoint llamar
      if (this.searchQuery !== '') {
        this.findMessagesByFilter(this.searchQuery, event);
      } else {
        this.getAllMessages(event);
      }
    } else {
      event.target.complete();
    }
  }

// Se añade el parámetro opcional event para manejar el scroll
  async getAllMessages(event?: any) {
    this.isLoading = true;

    let loading: HTMLIonLoadingElement | undefined;

    if (this.offset == 0 && !event) {
      loading = await this.core.loadingCtrl.create({
        message: 'Recuperando predicaciones...',
        cssClass: 'custom-loading',
        mode: 'md',
        spinner: null,
      })
      await loading.present();
    }

    const listenedIdsString = localStorage.getItem('listened') || '';

    this.core.api.message.getAllMessages({
      limit: this.limit,
      offset: this.offset,
      filterType: this.rbSelected,
      listenedIds: listenedIdsString
    })
      .subscribe({
        next: (data: any) => {
          if (data && data.messageListMapped) {
            const newMessages = data?.messageListMapped || [];

            if (newMessages.length < this.limit) {
              this.hasMoreData = false;
            }

            // If we're listing 'All' messages, we save them to core cache
            this.updateMessageList(newMessages, this.rbSelected === 'all');
          }

          if (event) event.target.complete();
        },
        error: (err: any) => {
          console.error(err);
          if (event) event.target.complete();
        },
      complete: () => {
        this.isLoading = false;
        if (loading) loading.dismiss();
      }
    });
  }

  refresh(event: any) {
    this.offset = 0;
    this.loadedMessages = [];
    this.hasMoreData = true;
    
    if (this.searchQuery === '') {
      this.core.messageList = []; // Vaciamos la caché para forzar datos nuevos
      this.getAllMessages(event);
    } else {
      this.findMessagesByFilter(this.searchQuery, event);
    }
  }

  removeFromListened(message: Message) {
    // event.stopPropagation()
    let listened = localStorage.getItem('listened');
    let arr1 = listened?.split(',')
    let arr = [...new Set(arr1)]
    const removed = arr.filter(element => parseInt(element) !== message.id);

    localStorage.setItem('listened', removed.toString())

    // this.resetListenedBeforeMark()
    this.checkIfAlreadyListened(this.loadedMessages);

    this.updateListRdBtn();
  }

  checkIfAlreadyListened(lista: Message[]) {
    let listened = localStorage.getItem('listened');

    if (!listened) {
      lista.forEach(msg => msg.listened = false);
      return;
    }

    let arr = [...new Set(listened.split(', '))];
    
    lista.forEach((message: Message) => {
      message.listened = arr.includes(message.id.toString());
    });
  }

  checkIfIsNewMessage(lista: Message[]) {
    let currentDate: number = new Date().getTime();

    lista.forEach((message: Message) => {
      let messageDate: number = new Date(message.createdAt).setDate(new Date(message.createdAt).getDate() + 3);
      message.isNew = messageDate > currentDate;
    });
  }

  /**
   * Función centralizada para gestionar actualización de la lista de predicaciones mostradas
   */
  updateMessageList(lista: Message[], saveToCore: boolean = false) {
    this.mapMessageListImages(lista); 
    this.checkIfAlreadyListened(lista);
    this.checkIfIsNewMessage(lista);

    // 1. Guardamos en nuestra lista íntegra (la que manda en la paginación)
    this.loadedMessages = this.loadedMessages.concat(lista);

    // 2. Calculamos el offset de forma segura
    this.offset = this.loadedMessages.length;

    // 3. Si es una carga normal, lo vamos guardando en la caché del core
    if (saveToCore) {
      this.core.messageList = this.core.messageList.concat(lista);
    }

    // 4. Mostramos en pantalla aplicando filtros de Radio Buttons
    this.updateListRdBtn();
  }

  async showFilterModal(event: any) {
    event?.stopPropagation();

    const modal = await this.core.modalCtrl.create({
      component: FilterModalComponent,
      componentProps: {}
    });

    modal.onDidDismiss().then(data => {
      if (data.data) {
        this.updateMessageList(data.data)
      }
    });

    await modal.present();
  }

  rbSelection(selection: string) {
    if (this.rbSelected === selection) return; 

    this.rbSelected = selection;

    // If we return to 'All' and there is no search we load cached messages
    if (this.rbSelected === 'all' && this.searchQuery === '' && this.core.messageList.length > 0) {
      this.loadedMessages = [...this.core.messageList];
      this.offset = this.loadedMessages.length;
      this.hasMoreData = true; // Maybe there is more data to load

      this.checkIfAlreadyListened(this.loadedMessages);
      this.updateListRdBtn();
      return;
    }

    // If we go to "Listened" or "Pending" or we're searching we will request to the server
    this.offset = 0;
    this.hasMoreData = true;
    this.loadedMessages = [];
    this.messageList = []; 

    if (this.searchQuery === '') {
      this.getAllMessages();
    } else {
      this.findMessagesByFilter(this.searchQuery);
    }
  }

  /**
   * 
   */
  updateListRdBtn() {
    this.messageList = [...this.loadedMessages];
  }

  /**
   * 
   */
  mapMessageListImages(lista: Message[]) {
    lista.forEach((msg: Message) => {
      let imgBase64: string = '';
      if (msg.image && (!msg.image.includes('data:image/jpeg;base64') && !msg.image.includes('../../../assets/images/thumbnail-'))) {
        imgBase64 = 'data:image/jpeg;base64,' + msg.image;
      } else if (!msg.image) {
        const randomNum = Math.floor(Math.random() * 6);
        imgBase64 = `../../../assets/images/thumbnail-${randomNum}.jpg`;
      }
      msg.image = imgBase64 !== '' ? imgBase64 : msg.image;
    });
  }

}
