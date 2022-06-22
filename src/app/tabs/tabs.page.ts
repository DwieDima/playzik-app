import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { IonTabs, GestureController, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})

export class TabsPage implements AfterViewInit {
  @ViewChild(IonTabs) tabs: IonTabs;
  @ViewChild('player', { read: ElementRef, static: true }) player: ElementRef;

  selected = '';
  openHeight = 0;

  private animation?;
  private animationImg?;
  private animationMinifed?;
  private gesture?;

  private started = false;
  private initialStep = 0;
  private MAX_TRANSLATE = 0;

  private baseEl;


  constructor(private gestureCtrl: GestureController, private animationCtrl: AnimationController) { }

  async ngAfterViewInit() {
    this.baseEl = this.player.nativeElement.querySelector('.player');

    this.player.nativeElement.style.setProperty('pointer-events', 'none');
    this.baseEl.style.setProperty('pointer-events', 'auto');

    this.MAX_TRANSLATE = this.player.nativeElement.clientHeight - this.baseEl.clientHeight;


    this.animationImg = this.animationCtrl.create()
      .addElement(this.baseEl.querySelector('img'))
      .duration(1000)
      .fromTo('width', '75px', `80vw`)
      .fromTo('transform', 'translate(0)', 'translate(-50%, -25%)')
      .fromTo('left', '0', '50%')
      .fromTo('top', '0', '25%');

    this.animationMinifed = this.animationCtrl.create()
      .addElement(this.baseEl.querySelectorAll('.minified > ion-col'))
      .addElement(this.baseEl.querySelector('.progress-bar'))
      .duration(1000)
      .keyframes([
        { offset: 0, transform: 'translateY(0)', opacity: '1' },
        { offset: .25, transform: 'translateY(-100%)', opacity: '0' },
        { offset: 1, transform: 'translateY(-100%)', opacity: '0' }
      ]);

    this.animation = this.animationCtrl.create()
      .addElement(this.baseEl)
      .duration(1000)
      .fromTo('transform', 'translateY(0)', `translateY(${-this.MAX_TRANSLATE}px)`)
      .addAnimation([this.animationImg, this.animationMinifed]);

    this.gesture = this.gestureCtrl.create({
      el: this.baseEl,
      threshold: 10,
      direction: 'y',
      gesturePriority: 100,
      gestureName: 'player-swipe',
      onStart: () => { console.log('Minified start') },
      onMove: ev => this.onMove(ev),
      onEnd: ev => this.onEnd(ev)
    })

    this.gesture.enable(true);
  }

  private onMove(ev) {
    if (!this.started) {
      this.animation.progressStart();
      this.started = true;
      console.log(this.animation);
      console.log(this.animation.isRunning(), this.animationImg.getKeyframes());
    }

    this.animation.progressStep(this.getStep(ev));
  }

  private onEnd(ev) {
    if (!this.started) { return; }

    this.gesture.enable(false);

    const step = this.getStep(ev);
    // const shouldComplete = step > 0.5;
    let shouldComplete = false;
    if (ev.deltaY > 100) shouldComplete = false;
    else if (ev.deltaY < -70) shouldComplete = true;

    this.animation.progressEnd((shouldComplete) ? 1 : 0, step).onFinish(() => { this.gesture.enable(true); });

    this.initialStep = (shouldComplete) ? this.MAX_TRANSLATE : 0;
    this.started = false;
  }

  private clamp(min, n, max) {
    return Math.max(min, Math.min(n, max));
  }

  private getStep(ev) {
    const delta = this.initialStep - ev.deltaY;
    return this.clamp(0, delta / this.MAX_TRANSLATE, 1);
  }

  setSelectedTab() {
    // console.log('CALLED');
    this.selected = this.tabs.getSelected();
  }
}
