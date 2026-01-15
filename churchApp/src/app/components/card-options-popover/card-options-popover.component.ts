import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-card-options-popover',
  templateUrl: './card-options-popover.component.html',
  styleUrls: ['./card-options-popover.component.scss'],
})
export class CardOptionsPopoverComponent  implements OnInit {

  // Recibe los datos necesarios del mensaje y el estado de autenticación
  @Input() data: any; 

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    // La propiedad 'data' contendrá el mensaje y el estado de core.isAuthUser
  }

  // Función para devolver la acción seleccionada y cerrar el popover
  action(actionName: string) {
    this.popoverController.dismiss({ action: actionName });
  }
}
