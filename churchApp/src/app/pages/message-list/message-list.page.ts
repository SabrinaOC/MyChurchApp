import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Message } from '../../models/interfaces';
import { InfiniteScrollCustomEvent, IonContent, IonSearchbar, LoadingController } from '@ionic/angular';
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

  limit: number = 5;
  offset: number = 0;

  private subscription: Subscription = new Subscription();

  constructor(
              public core: CoreProvider,
              private loadingController: LoadingController
  ) { }

  ngOnInit(): void {
    const sub = this.core.audio.listened.subscribe(value => {
        this.updateMessageList(this.messageList);
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
    if(!this.messageList.length) {
      this.getAllMessages();
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
    const query = event.target.value.toLowerCase();
    if(query && query != '' && query.length > 0) {
      this.findMessagesByFilter(query);
    }
  }

  async findMessagesByFilter(query: string) {
    // let loading = await this.loadingController.create({
    //   message: 'Recuperando predicaciones...',
    //   cssClass: 'custom-loading',
    //   mode: 'md',
    //   spinner: null,
    // })
    // loading.present();

    this.isLoading = true;

    this.core.api.message.findByTitle({ searchedTitle: query, limit: this.limit, offset: this.offset })
      .subscribe({
        next: (val: any) => {
          console.log('------------', val.messageListMapped);
          
          this.updateMessageList(val.messageListMapped)

          this.updateListRdBtn()
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          console.log("Finnished searching");
          this.isLoading = false;
          // loading.dismiss()
        }
      })
  }
  
  scrollAndSearch(event: InfiniteScrollCustomEvent) {
    if (!this.isLoading) {
      this.findMessagesByFilter(this.searchBar.value!);
      event.target.complete();
    }
  }

  async getAllMessages() {
    this.offset = 0;
    this.isLoading = true;
    console.log("Todas las predicaciones");
    
    let loading = await this.loadingController.create({
      message: 'Recuperando predicaciones...',
      cssClass: 'custom-loading',
      mode: 'md',
      spinner: null,
    })
    loading.present();
    console.log("Limit: ", this.limit, "Offset: ", this.offset);
    
    this.core.api.message.getAllMessages({limit: this.limit, offset: this.offset})
    .subscribe({
      next: (data: any) => {
        if(data) {
          this.updateMessageList(data.messageListMapped, true)
        }
        
        loading.dismiss()
      },
      error: (err: any) => {
        console.error(err)
        loading.dismiss()
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  refresh(event: any) {
    this.core.api.message.getAllMessages({limit: this.limit, offset: this.offset})
    .subscribe((data: any) => {
      if(data) {
        this.updateMessageList(data.messageListMapped, true)
      }
      event.target.complete();
    })
  }

  removeFromListened(message: Message) {
    // event.stopPropagation()
    let listened = localStorage.getItem('listened');
    let arr1 = listened?.split(',')
    let arr = [...new Set(arr1)]
    const removed = arr.filter(element => parseInt(element) !== message.id);

    localStorage.setItem('listened', removed.toString())

    this.resetListenedBeforeMark()
    this.checkIfAlreadyListened()
  }

  checkIfAlreadyListened() {
    let listened = localStorage.getItem('listened');
    
    let arr1 = listened?.split(',')
    let arr = [...new Set(arr1)]
    this.messageList.forEach((message: Message )=> {
        arr?.forEach(element => {
          if(parseInt(element) === message.id) {
            message.listened = true;
          }
        })
    })

    if(this.rbSelected === 'all') {
      this.backupListForRbFilter = _.cloneDeep(this.messageList);
    }
  }

  checkIfIsNewMessage() {
    let newMessage: boolean = false;

    this.messageList.forEach((message: Message) => {      
      // Get the current date and the creation date of the message
      let currentDate: number = new Date().getTime(); //Time in unix
      // We add days to that date to compare in that range with the current one
      let messageDate: number = new Date(message.createdAt).setDate(new Date(message.createdAt).getDate() + 3);
            
      if (messageDate > currentDate) {
        message.isNew = true;
        newMessage = true;
      } else {
        message.isNew = false;
      }
    });

    // Order list by isNew property
    if (newMessage) {
      this.messageList.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }
  }

  /**
   * Función centralizada para gestionar actualización de la lista de predicaciones mostradas
   */
  updateMessageList(lista: Message[], allMessages: boolean = false) {
    this.messageList = this.messageList.concat(lista);
    
    this.offset = this.messageList.length;
    console.log(this.messageList);
    
    if (allMessages) {
      this.core.messageList = this.core.messageList.concat(lista);
    }

    this.mapMessageListImages();
    this.checkIfAlreadyListened();
    this.checkIfIsNewMessage();
  }

  resetListenedBeforeMark() {
    this.messageList.forEach(msg => {
      msg.listened = false;
    })
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
    this.rbSelected = selection;

    this.updateListRdBtn()
  }

  /**
   * 
   */
  updateListRdBtn() {
    // actualizamos lista con este filtro
    if(this.rbSelected === 'all') {
      this.messageList = this.backupListForRbFilter;
    } else if (this.rbSelected === 'listened') {
      this.messageList = this.backupListForRbFilter.filter(msg => msg.listened && msg.listened === true)
    } else if (this.rbSelected === 'pending') {
      this.messageList = this.backupListForRbFilter.filter(msg => !(msg.listened && msg.listened === true))
    }

    //actualizamos visualizacion de lista
    this.updateMessageList(this.messageList)
  }

  /**
   * 
   */
  mapMessageListImages() {
    this.messageList.forEach((msg: Message) => {
      let imgBase64: string = '';
      if(msg.image && (!msg.image.includes('data:image/jpeg;base64') && !msg.image.includes('../../../assets/images/thumbnail-'))) {
        imgBase64 = 'data:image/jpeg;base64,' + msg.image
      } else if(!msg.image) {
        const randomNum = Math.floor(Math.random() * 6);
        imgBase64 = `../../../assets/images/thumbnail-${randomNum}.jpg`;
      }
      msg.image = imgBase64 != '' ? imgBase64 : msg.image;
    })
  }

}
