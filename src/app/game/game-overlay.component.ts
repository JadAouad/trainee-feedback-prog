import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './game.service';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-game-overlay',
  standalone: true,
  imports: [CommonModule, IonIcon],
  styles: [`:host{display:block;pointer-events:none}`],
  template: `
    <!-- Red flash screen -->
    @if (game.isFlashingRed()) {
      <div class="red-flash-screen"></div>
    }

    <!-- White flash screen -->
    @if (game.isFlashingWhite()) {
      <div class="white-flash-screen"></div>
    }

    <!-- Active game session -->
    @if (game.isGameActive()) {
      <div class="animals-canvas">

        <!-- Close / Dismiss button -->
        <button type="button" class="dismiss-btn" (click)="game.resetGame()" title="Close Game">
          <ion-icon name="close-outline" style="font-size: 20px;"></ion-icon>
        </button>

        <!-- STAGE 1: FISH (dodges for 10s upon first move) -->
        @if (game.currentStage() === 'fish') {
          <div
            class="animal-avatar"
            [class.clickable]="game.canClickCurrent()"
            [style.left.px]="game.animalPos().x"
            [style.top.px]="game.animalPos().y"
            (click)="game.onAnimalClick()"
          >
            <div class="game-bubble">{{ game.animalBubble() }}</div>
            <!-- Fish SVG -->
            <svg width="135" height="90" viewBox="0 0 160 110" fill="none">
              <path d="M125 55L155 25C150 50 150 60 155 85L125 55Z" fill="#f97316"/>
              <path d="M60 25C75 10 95 10 105 25Z" fill="#ea580c"/>
              <path d="M65 85C75 100 95 100 105 85Z" fill="#ea580c"/>
              <ellipse cx="75" cy="55" rx="55" ry="35" fill="#fb923c"/>
              <path d="M65 22C75 22 75 88 65 88C58 88 58 22 65 22Z" fill="#ffffff"/>
              <path d="M98 30C103 30 103 80 98 80C94 80 94 30 98 30Z" fill="#ffffff"/>
              <path d="M60 55C50 60 45 70 55 75C65 72 70 65 60 55Z" fill="#ea580c"/>
              <circle cx="35" cy="45" r="9" fill="#ffffff"/>
              <circle cx="33" cy="45" r="5" fill="#0f172a"/>
              <circle cx="35" cy="43" r="2" fill="#ffffff"/>
              <path d="M22 55C26 62 32 62 36 58" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
        }

        <!-- STAGE 2: SHARK (dodges for 5s) -->
        @if (game.currentStage() === 'shark') {
          <div
            class="animal-avatar"
            [class.clickable]="game.canClickCurrent()"
            [style.left.px]="game.animalPos().x"
            [style.top.px]="game.animalPos().y"
            (click)="game.onAnimalClick()"
          >
            <div class="game-bubble">{{ game.animalBubble() }}</div>
            <!-- Shark SVG -->
            <svg width="170" height="105" viewBox="0 0 200 120" fill="none">
              <path d="M10 110C30 80 70 60 110 60C150 60 180 80 190 110C170 120 130 120 100 120C60 120 25 120 10 110Z" fill="#475569"/>
              <path d="M90 60L105 10L125 55Z" fill="#334155"/>
              <path d="M30 110C60 90 120 90 170 110C140 118 60 118 30 110Z" fill="#f8fafc"/>
              <circle cx="150" cy="80" r="6" fill="#0f172a"/>
              <circle cx="152" cy="78" r="2" fill="#ffffff"/>
              <line x1="120" y1="75" x2="120" y2="95" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
              <line x1="127" y1="77" x2="127" y2="93" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
              <line x1="134" y1="79" x2="134" y2="91" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
              <path d="M140 100L145 94L150 100L155 94L160 100L165 94L170 100" stroke="#ffffff" stroke-width="3" fill="#dc2626"/>
            </svg>
          </div>
        }

        <!-- STAGE 3: SEA TURTLE (dodges for 5s) -->
        @if (game.currentStage() === 'turtle') {
          <div
            class="animal-avatar"
            [class.clickable]="game.canClickCurrent()"
            [style.left.px]="game.animalPos().x"
            [style.top.px]="game.animalPos().y"
            (click)="game.onAnimalClick()"
          >
            <div class="game-bubble">{{ game.animalBubble() }}</div>
            <!-- Sea Turtle SVG -->
            <svg width="150" height="105" viewBox="0 0 160 120" fill="none">
              <ellipse cx="40" cy="30" rx="22" ry="12" transform="rotate(-30 40 30)" fill="#16a34a"/>
              <ellipse cx="40" cy="90" rx="22" ry="12" transform="rotate(30 40 90)" fill="#16a34a"/>
              <ellipse cx="120" cy="32" rx="16" ry="9" transform="rotate(25 120 32)" fill="#15803d"/>
              <ellipse cx="120" cy="88" rx="16" ry="9" transform="rotate(-25 120 88)" fill="#15803d"/>
              <ellipse cx="80" cy="60" rx="48" ry="36" fill="#15803d" stroke="#14532d" stroke-width="3"/>
              <polygon points="80,38 95,48 95,68 80,78 65,68 65,48" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
              <line x1="80" y1="38" x2="80" y2="24" stroke="#14532d" stroke-width="2"/>
              <line x1="80" y1="78" x2="80" y2="96" stroke="#14532d" stroke-width="2"/>
              <ellipse cx="28" cy="60" rx="16" ry="12" fill="#22c55e"/>
              <circle cx="22" cy="56" r="3" fill="#0f172a"/>
              <circle cx="23" cy="55" r="1" fill="#ffffff"/>
            </svg>
          </div>
        }

        <!-- STAGE 4: STARFISH (moves for 10s with question on head, then stops and allows answer) -->
        @if (game.currentStage() === 'starfish') {
          <div
            class="animal-avatar"
            [style.left.px]="game.animalPos().x"
            [style.top.px]="game.animalPos().y"
          >
            <!-- Question on its head -->
            <div class="game-bubble">{{ game.animalBubble() }}</div>

            <!-- Starfish SVG -->
            <svg width="150" height="150" viewBox="0 0 160 160" fill="none">
              <polygon
                points="80,15 97,55 145,55 106,85 122,130 80,102 38,130 54,85 15,55 63,55"
                fill="#f43f5e"
                stroke="#be123c"
                stroke-width="4"
                stroke-linejoin="round"
              />
              <circle cx="80" cy="45" r="4" fill="#fb7185"/>
              <circle cx="80" cy="75" r="5" fill="#fb7185"/>
              <circle cx="65" cy="70" r="3.5" fill="#fb7185"/>
              <circle cx="95" cy="70" r="3.5" fill="#fb7185"/>
              <circle cx="72" cy="65" r="4" fill="#0f172a"/>
              <circle cx="88" cy="65" r="4" fill="#0f172a"/>
              <path d="M74 76C77 80 83 80 86 76" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
            </svg>

            <!-- When stopped (after 10 seconds), user can select simple Yes / No -->
            @if (game.starfishAnswerReady()) {
              <div class="starfish-answer-box">
                <button
                  type="button"
                  class="game-action-btn btn-yes"
                  style="min-width: 90px;"
                  (click)="game.selectOutcome('yes')"
                >
                  Yes
                </button>
                <button
                  type="button"
                  class="game-action-btn btn-no"
                  style="min-width: 90px;"
                  (click)="game.selectOutcome('no')"
                >
                  No
                </button>
              </div>
            }
          </div>
        }

        <!-- FINAL OUTCOME: YES (Middle Finger Pulsating) -->
        @if (game.currentStage() === 'final_yes') {
          <div class="glow-ring" style="border-color: rgba(239, 68, 68, 0.8);"></div>
          <div class="pulsating-finger">
            🖕
          </div>
          <div class="replay-control">
            <button type="button" class="game-action-btn btn-yes" (click)="game.startPlay()">
              <ion-icon name="refresh-outline" slot="start" style="vertical-align: middle; margin-right: 4px;"></ion-icon>
              Play Again
            </button>
          </div>
        }

        <!-- FINAL OUTCOME: NO (Aubergine + Crazy Fireworks & Lights) -->
        @if (game.currentStage() === 'final_no') {
          <div class="disco-stage"></div>
          <div class="glow-ring"></div>
          <div class="glow-ring" style="animation-delay: 0.6s; border-color: rgba(168, 85, 247, 0.7);"></div>

          <div class="aubergine-crazy">
            🍆
          </div>

          <!-- Dynamic Firework Particle Bursts -->
          @for (spark of fireworkSparks; track spark.id) {
            <div
              class="firework-spark"
              [style.background]="spark.color"
              [style.--tx]="spark.tx"
              [style.--ty]="spark.ty"
              [style.animation-delay]="spark.delay"
              [style.width.px]="spark.size"
              [style.height.px]="spark.size"
            ></div>
          }

          <div class="replay-control">
            <button type="button" class="game-action-btn btn-no" (click)="game.startPlay()">
              <ion-icon name="refresh-outline" slot="start" style="vertical-align: middle; margin-right: 4px;"></ion-icon>
              Play Again
            </button>
          </div>
        }

      </div>
    }
  `
})
export class GameOverlayComponent {
  readonly game = inject(GameService);

  readonly fireworkSparks = generateSparks();

  constructor() {
    addIcons({ closeOutline, refreshOutline });
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.game.isGameActive()) {
      this.game.handleAnimalProximity(event.clientX, event.clientY);
    }
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.game.isGameActive() && event.touches.length > 0) {
      const touch = event.touches[0];
      this.game.handleAnimalProximity(touch.clientX, touch.clientY);
    }
  }
}

interface Spark {
  id: number;
  color: string;
  tx: string;
  ty: string;
  delay: string;
  size: number;
}

function generateSparks(): Spark[] {
  const colors = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#f97316'];
  const sparks: Spark[] = [];
  const count = 36;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const distance = 140 + Math.random() * 260;
    const tx = `${Math.round(Math.cos(angle) * distance)}px`;
    const ty = `${Math.round(Math.sin(angle) * distance)}px`;
    const delay = `${(Math.random() * 0.9).toFixed(2)}s`;
    const size = Math.floor(Math.random() * 8) + 8;
    const color = colors[i % colors.length];

    sparks.push({ id: i, color, tx, ty, delay, size });
  }

  return sparks;
}
