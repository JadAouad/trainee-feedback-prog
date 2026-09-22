import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { GameOverlayComponent } from './game/game-overlay.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, GameOverlayComponent],
})
export class AppComponent {
  constructor() {}
}
