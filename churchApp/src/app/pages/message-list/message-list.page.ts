import { Component, ViewChild } from '@angular/core';
import { Message, MessageFilterOpt } from '../../models/interfaces';
import { RestService } from '../../services/rest.service';
import { IonModal, LoadingController, Platform } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Share } from '@capacitor/share';
import * as _ from 'lodash';
import { CoreProvider } from 'src/app/services/core';
// import { HTTP } from '@ionic-native/http/ngx';
// import {File} from '@ionic-native/file/ngx';
import { Http } from '@capacitor-community/http';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.page.html',
  styleUrls: ['./message-list.page.scss'],
})

export class MessageListPage {
  messageList!: Message[]
  isDesktop: boolean = false;
  filterForm!: FormGroup;
  datetime!: Date;
  @ViewChild(IonModal) modal!: IonModal;
  rbSelected: string = 'all';
  backupListForRbFilter!: Message[];
  searchQuery: string = '';
  constructor(
              public restService: RestService,
              private loadingController: LoadingController,
              private formBuilder: FormBuilder,
              public core: CoreProvider,
              private platform: Platform
  ) { 
    this.filterForm = this.formBuilder.group({
      speaker: new FormControl(null),
      book: new FormControl(null),
      testament: new FormControl(null),
      dateFrom: new FormControl(null),
      dateTo: new FormControl(null),
    })
  }

  async ionViewWillEnter() {
    this.getAllMessages();
  }

  openUrl(targetUrl: string) {
    AppLauncher.openUrl({url: targetUrl, })
  }

  async searchInput(event: any) {
    const query = event.target.value.toLowerCase();
    if(query && query != '' && query.length > 0) {
      let loading = await this.loadingController.create({
        message: 'Recuperando predicaciones...',
        cssClass: 'custom-loading',
        spinner: null,
      })
      loading.present();

      console.log('BUSQUEDA: ', query)
      this.restService.getMessagesByTitle(query).subscribe({
        next: (val: any) => {
          this.updateMessageList(val.messageListMapped)
          this.rbSelection(this.rbSelected)
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          loading.dismiss()
        }
      })
    }
  }

  async getAllMessages() {
    let loading = await this.loadingController.create({
      message: 'Recuperando predicaciones...',
      cssClass: 'custom-loading',
      spinner: null,
    })
    loading.present();
    console.log('ionViewWillEnter')
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.updateMessageList(data.messageListMapped)
      }
      loading.dismiss()
    })
  }

  async searchFilter() {
      let loading = await this.loadingController.create({
        message: 'Aplicando filtros...',
        cssClass: 'custom-loading',
        spinner: null,
      })
      loading.present();

      let filtrosBusqueda: MessageFilterOpt = this.filterForm.value
      

      // console.log('BUSQUEDA: ', this.removeNullUndefined(filtrosBusqueda))
      this.restService.getMessagesByFilterOptions(this.removeNullUndefined(filtrosBusqueda)).subscribe({
        next: (val: any) => {
          this.updateMessageList(val.messageListMapped)
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          this.resetFiltros();
          loading.dismiss()
        }
      })
    
  }

  removeNullUndefined(obj: any): any {
    return Object.keys(obj).reduce((acc, key) => {
      if (obj[key] !== null && obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as any);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
    this.searchFilter();
  }

  resetFiltros() {
    this.filterForm.reset();
  }

  refresh(event: any) {
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.updateMessageList(data.messageListMapped)
      }
      event.target.complete();
    })
  }

  markAsListened(message: Message, event: any) {
    event.stopPropagation()
    //localStorage to track lilstened messages
    let listened = localStorage.getItem('listened');
    // console.log('listened => ', listened)
    if(listened === null) {
      localStorage.setItem('listened', `${message.id}`)
    } else {
      listened += `, ${message.id}`
      localStorage.setItem('listened', listened)

    }
    
    this.updateMessageList(this.messageList)
  }

  removeFromListened(message: Message, event: any) {
    event.stopPropagation()
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
    // console.log('localStorage : ', arr)
    this.messageList.forEach((message: Message )=> {
        arr?.forEach(element => {
          // console.log('element => ', element, '\tMessage => ', message.id)
          if(parseInt(element) === message.id) {
            // console.log('COINCIDENCIAAAAAAAAAAAAAAAAAAAAAAAA')
            message.listened = true;
          }
        })
    })

    if(this.rbSelected === 'all') {
      this.backupListForRbFilter = _.cloneDeep(this.messageList);
    }
  }

  /**
   * Función centralizada para gestionar actualización de la lista de predicaciones mostradas
   */
  updateMessageList(lista: any) {
    this.messageList = lista;
    this.checkIfAlreadyListened()
  }

  resetListenedBeforeMark() {
    this.messageList.forEach(msg => {
      msg.listened = false;
    })
  }

  async shareMessage(message: Message, event: any) {
    event.stopPropagation()

    await Share.share({
      title: `${message.title}`,
      text: `*${message.title}*. Te invito a escuchar esta predicación`,
      url: `${message.url}`,
      // dialogTitle: `${message.title}`,
    });
  }

  rbSelection(event: any) {
    this.rbSelected = event.target.value

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



  async downloadMessage(message: Message, event: any) {
    event.stopPropagation();

    const alert = await this.core.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: `Descargar predicación`, //${message.title.trim()}
      message: 'Si haces click en aceptar, la predicación se descargará en su dispositivo',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            console.log(message);
            // const newBlob = new Blob([response], { type: "audio/mp3" });
            // const data = window.URL.createObjectURL(newBlob);
            // const link = document.createElement("a");
            // link.href = data;
            // link.download = message.normalized_title; // set a name for the file
            // link.click();

            //------------------------------------
            // let headers = new HttpHeaders();
            // headers = headers.set('Accept', 'application/mp3');
            // console.log(headers, message.url);

            // return this.http.get(message.url, {headers, responseType: 'blob'});

            //------------------------------------
            // FileSaver.saveAs(message.url, message.title + '.mp3');

            //------------------------------------
            // const fileId: string = message.url.substring(message.url.indexOf("/d/") + 3, message.url.indexOf("/view"));
            // const url: string = `https://drive.google.com/uc?export=download&id=${fileId}`;
            // console.log(url);

            // this.openUrl(url);

            // const a = document.createElement('a');
            // a.href = url;
            // a.target = "_blank";
            // a.download = message.title.trim() + ".mp3"; // Nombre predeterminado del archivo
            // a.click();

            //------------------------------------
            // let headers = new HttpHeaders();
            // headers = headers.set('Accept', 'audio/mpeg');
            // this.http.get(url, { headers, responseType: 'blob' }).subscribe((blob) => {
            //   // Crea un enlace temporal para descargar el archivo
            //   const a = document.createElement('a');
            //   const objectUrl = URL.createObjectURL(blob);
            //   a.href = objectUrl;
            //   a.download = message.title.trim() + ".mp3"; // Nombre predeterminado del archivo
            //   a.click();
            //   URL.revokeObjectURL(objectUrl); // Limpia la URL del objeto
            // });

            //------------------------------------

            const fileId: string = message.url.substring(message.url.indexOf("/d/") + 3, message.url.indexOf("/view"));
            const url: string = `https://drive.google.com/uc?export=download&id=${fileId}`;
            const fileName: string = message.title.trim() + ".mp3";
            console.log(url);

            if (this.platform.is('desktop')) {
              console.log("desktop");

              const a = document.createElement('a');
              a.href = url;
              a.target = "_blank";
              a.download = fileName // Nombre predeterminado del archivo
              a.click();

            } else { //Mobile
              console.log("mobile");
              // this.http.downloadFile(url, {}, {}, this.file.dataDirectory + message.title.trim() + ".mp3").then(res => {
              //   console.log(res);
              // }).catch(err => {
              //   console.error(err);
              // })
              this.downloadFile(url, fileName);
            }
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            alert.dismiss('cancel');
          }
        },
      ]
    });

    await alert.present();
  }

  async downloadFile(downloadUrl: string, fileName: string) {
    try {
      // // Realiza la solicitud para obtener el archivo
      // const response = await Http.request({
      //   method: 'GET',
      //   // url: downloadUrl,
      //   // url: "https://www.uco.es/investigacion/portal/images/documentos/programa-propio/CandidatosBOUCOProv6_19.pdf",
      //   url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      //   // responseType: 'blob' // Especifica que esperas un binario
      // });
      
      // console.log('Tipo de respuesta:', response.headers['Content-Type']);
      // console.log(response);
      const proxyUrl: string = 'https://cors-anywhere.herokuapp.com/';
      // const response = await fetch(proxyUrl + encodeURIComponent('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'), { headers: { 'Access-Control-Allow-Origin': '*' } });
      const response = await fetch(downloadUrl);
      console.log(response);

      const blob = await response.blob();
      console.log(blob);

      if (blob) {
        // Convierte el blob a un Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
    
          // Guarda el archivo en el sistema de archivos
          const savedFile = await Filesystem.writeFile({
            path: fileName, // Nombre con el que se guardará el archivo
            data: base64data.split(',')[1], // Remover la parte 'data:' del base64
            directory: Directory.Documents, // Directorio donde se guardará el archivo
            encoding: Encoding.UTF8,
          });
    
          console.log('Archivo guardado en:', savedFile.uri);
        };
      } else {
        console.error(response, 'No se recibió ningún dato en la respuesta');
      }
    } catch (error) {
      console.error('Error descargando el archivo:', error);
      console.error('Detalles del error:', JSON.stringify(error));
    }
  }
}