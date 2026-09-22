import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { GameService } from './game.service';

@Component({
  selector: 'app-game-prompt-modal',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .prompt-wrapper {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
    }

    .prompt-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px 24px 20px;
      width: 100%;
      max-width: 320px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
      border: 1px solid #e2e8f0;
      text-align: left;
    }

    .prompt-question {
      margin: 0 0 18px;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.35;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .radio-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
      font-size: 0.95rem;
      font-weight: 600;
      color: #1e293b;
    }

    .radio-item:hover:not(.disabled) {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .radio-item.disabled {
      cursor: not-allowed;
      opacity: 0.85;
      background: #f8fafc;
      color: #64748b;
    }

    .radio-item input[type="radio"] {
      width: 18px;
      height: 18px;
      margin: 0;
      cursor: pointer;
      accent-color: #005eb8;
    }

    .radio-item.disabled input[type="radio"] {
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="prompt-wrapper" (click)="dismiss()">
      <div class="prompt-card" (click)="$event.stopPropagation()">
        <!-- ONLY the question -->
        <h3 class="prompt-question">do you want to play?</h3>

        <!-- ONLY the radio buttons -->
        <div class="radio-group">
          <!-- Yes Radio (starts game directly and closes popup) -->
          <div class="radio-item" (click)="chooseYes()">
            <input type="radio" id="radio-yes" name="playOption" />
            <label for="radio-yes" style="cursor: pointer; width: 100%;">Yes</label>
          </div>

          <!-- Disabled No Radio (triggers screen flash red on click) -->
          <div class="radio-item disabled" (click)="tryClickNo($event)">
            <input type="radio" id="radio-no" name="playOption" disabled />
            <label for="radio-no" style="cursor: not-allowed; width: 100%;">No</label>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GamePromptModalComponent {
  private modalCtrl = inject(ModalController);
  private game = inject(GameService);

  chooseYes() {
    this.game.startPlay();
    this.modalCtrl.dismiss();
  }

  tryClickNo(event: MouseEvent) {
    event.stopPropagation();
    this.game.triggerRedFlash();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
