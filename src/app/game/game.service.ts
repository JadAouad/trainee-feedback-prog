import { Injectable, signal } from '@angular/core';

export type GameStage = 'fish' | 'shark' | 'turtle' | 'starfish' | 'final_yes' | 'final_no';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  readonly isPromptOpen = signal<boolean>(false);
  readonly isGameActive = signal<boolean>(false);
  readonly isFlashingRed = signal<boolean>(false);
  readonly isFlashingWhite = signal<boolean>(false);

  readonly currentStage = signal<GameStage>('fish');
  readonly animalPos = signal<{ x: number; y: number }>({ x: 200, y: 300 });
  readonly animalBubble = signal<string>('touch me');
  readonly canClickCurrent = signal<boolean>(false);
  readonly starfishAnswerReady = signal<boolean>(false);

  private timerActive = false;
  private timerRef: any = null;

  openPrompt() {
    this.isPromptOpen.set(true);
  }

  closePrompt() {
    this.isPromptOpen.set(false);
  }

  triggerRedFlash() {
    this.isFlashingRed.set(true);
    setTimeout(() => {
      this.isFlashingRed.set(false);
    }, 450);
  }

  startPlay() {
    this.isPromptOpen.set(false);
    this.isFlashingWhite.set(true);
    setTimeout(() => {
      this.isFlashingWhite.set(false);
    }, 350);

    this.isGameActive.set(true);
    this.initStage('fish');
  }

  initStage(stage: GameStage) {
    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }
    this.timerActive = false;
    this.canClickCurrent.set(false);
    this.starfishAnswerReady.set(false);
    this.currentStage.set(stage);

    const winW = typeof window !== 'undefined' ? window.innerWidth : 800;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 600;

    if (stage === 'fish') {
      // Fish peeks from right edge initially
      this.animalPos.set({ x: Math.max(100, winW - 130), y: Math.max(100, Math.floor(winH * 0.45)) });
      this.animalBubble.set('touch me');
    } else if (stage === 'shark') {
      // Shark peeks from top initially
      this.animalPos.set({ x: Math.max(80, Math.floor(winW * 0.5) - 85), y: 30 });
      this.animalBubble.set('try again');
      this.startSharkTimer();
    } else if (stage === 'turtle') {
      // Turtle peeks from left
      this.animalPos.set({ x: 40, y: Math.max(100, Math.floor(winH * 0.55)) });
      this.animalBubble.set('catch me!');
      this.startTurtleTimer();
    } else if (stage === 'starfish') {
      // Starfish moves for 10s with the question on its head
      this.animalPos.set({ x: Math.max(60, Math.floor(winW * 0.5) - 75), y: Math.max(80, Math.floor(winH * 0.35)) });
      this.animalBubble.set('is this what you want? to keep chasing you for a touch?');
      this.startStarfishTimer();
    }
  }

  handleAnimalProximity(cursorX: number, cursorY: number) {
    const stage = this.currentStage();
    // In starfish stage, stops dodging once starfishAnswerReady is true
    if (stage === 'starfish') {
      if (this.starfishAnswerReady()) {
        return;
      }
    } else if (this.canClickCurrent() || stage === 'final_yes' || stage === 'final_no') {
      return;
    }

    const pos = this.animalPos();
    const centerX = pos.x + 75;
    const centerY = pos.y + 60;

    const dist = Math.hypot(cursorX - centerX, cursorY - centerY);
    const threshold = 140; // evasion radius

    if (dist < threshold) {
      // Dart away!
      this.dodgeFromCursor(cursorX, cursorY);

      // If fish and timer hasn't started, start 10s countdown on first move
      if (stage === 'fish' && !this.timerActive) {
        this.startFishTimer();
      }
    }
  }

  private startFishTimer() {
    this.timerActive = true;
    this.timerRef = setTimeout(() => {
      if (this.currentStage() === 'fish') {
        this.canClickCurrent.set(true);
        this.animalBubble.set('did you give up?');
      }
    }, 10000);
  }

  private startSharkTimer() {
    this.timerActive = true;
    this.timerRef = setTimeout(() => {
      if (this.currentStage() === 'shark') {
        this.canClickCurrent.set(true);
        this.animalBubble.set('click me!');
      }
    }, 5000);
  }

  private startTurtleTimer() {
    this.timerActive = true;
    this.timerRef = setTimeout(() => {
      if (this.currentStage() === 'turtle') {
        this.canClickCurrent.set(true);
        this.animalBubble.set('got me!');
      }
    }, 5000);
  }

  private startStarfishTimer() {
    this.timerActive = true;
    this.timerRef = setTimeout(() => {
      if (this.currentStage() === 'starfish') {
        // Starfish stops after 10 seconds and user can select the answer
        this.starfishAnswerReady.set(true);
      }
    }, 10000);
  }

  dodgeFromCursor(cursorX: number, cursorY: number) {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 800;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 600;

    const pad = 80;
    let newX = posRandom(pad, winW - pad - 120);
    let newY = posRandom(pad, winH - pad - 100);

    let attempts = 0;
    while (Math.hypot(cursorX - newX, cursorY - newY) < 220 && attempts < 10) {
      newX = posRandom(pad, winW - pad - 120);
      newY = posRandom(pad, winH - pad - 100);
      attempts++;
    }

    this.animalPos.set({ x: newX, y: newY });
  }

  onAnimalClick() {
    const stage = this.currentStage();
    if (!this.canClickCurrent()) {
      return;
    }

    if (stage === 'fish') {
      this.initStage('shark');
    } else if (stage === 'shark') {
      this.initStage('turtle');
    } else if (stage === 'turtle') {
      this.initStage('starfish');
    }
  }

  selectOutcome(outcome: 'yes' | 'no') {
    if (outcome === 'yes') {
      this.currentStage.set('final_yes');
    } else {
      this.currentStage.set('final_no');
    }
  }

  resetGame() {
    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }
    this.timerActive = false;
    this.isGameActive.set(false);
    this.canClickCurrent.set(false);
    this.starfishAnswerReady.set(false);
    this.currentStage.set('fish');
  }
}

function posRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
