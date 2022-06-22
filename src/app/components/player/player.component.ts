import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AnimationController, GestureController, Platform } from '@ionic/angular';
import { Howl } from 'howler';

export interface Track {
  name: string;
  url: string;
  thumbnails: string;
  requester: string;
  vote: number;
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements AfterViewInit {
  @ViewChild('footer', { read: ElementRef, static: true }) footer: ElementRef;
  @ViewChild('playerContainer', { read: ElementRef, static: true }) playerContainer: ElementRef;

  progress = 0;

  playlist: Track[] = [{
    name: 'Garo - LVZ',
    url: 'https://rr3---sn-25ge7nse.googlevideo.com/videoplayback?expire=1655936705&ei=YUKzYttynY6YsA_N7IKICQ&ip=127.0.0.1&id=o-AB31kxgx-hWhuYOj5U_wkFmPWcb1BAcwBDRX7W17bge_&itag=251&source=youtube&requiressl=yes&mh=zg&mm=31%2C29&mn=sn-25ge7nse%2Csn-4gxx-25gee&ms=au%2Crdu&mv=m&mvi=3&pl=12&nh=%2CEAE&initcwndbps=1141250&spc=4ocVCx-xnTMLK_7kVuSXzjwYeSyGy0k&vprv=1&mime=audio%2Fwebm&ns=D_WwcZgeHbhAfhRXPxvpMQUG&gir=yes&clen=2497470&dur=138.761&lmt=1610189542745314&mt=1655914617&fvip=7&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5531432&n=O7ZacsxDhxrN7g&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRQIgZm8_ja6nXXKICdoLIP5PF8s-OevSsutUgCWYJ9bvWoACIQDb_h1wM1BIG28qrmPL_y031HsGfJexwAED5hbUbr-XOw%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cnh%2Cinitcwndbps&lsig=AG3C_xAwRQIgRKg_YEY_xSnhUSCQHYbSuyL8yErFJoGg4_hBWf_Umk8CIQDpG7VF6KzsMZaDWwtXIJ_1Zg84KHJxkbMy1lRwqmpaag%3D%3D',
    thumbnails: 'string',
    requester: 'string',
    vote: 0,
  }]

  player: Howl = null;
  isPlaying = false;
  activeTrack: Track = null;

  private animation?;
  private animationMinifed?;
  private animationImg?;
  private gesture?;

  private started = false;
  private initialStep = 0;
  private MAX_TRANSLATE = 0;

  private baseEl;

  constructor(private gestureCtrl: GestureController, private plt: Platform, private animationCtrl: AnimationController) { }

  ngAfterViewInit() {
    this.baseEl = this.footer.nativeElement;

    // this.player.nativeElement.style.setProperty('pointer-events', 'none');
    // this.baseEl.style.setProperty('pointer-events', 'auto');


    this.MAX_TRANSLATE = this.plt.height() - (54 + 75);

    this.animationImg = this.animationCtrl.create()
      .addElement(this.playerContainer.nativeElement.querySelector('img'))
      .duration(1000)
      .fromTo('width', '80vw', '75px')
      .fromTo('transform', 'translate(-50%, -25%)', 'translate(0)')
      .fromTo('left', '50%', '0')
      .fromTo('top', '25%', '0');

    this.animationMinifed = this.animationCtrl.create()
      .addElement(this.playerContainer.nativeElement.querySelectorAll('.minified > ion-col'))
      .duration(1000)
      .keyframes([
        { offset: 0, transform: 'translateY(-100%)', opacity: '0' },
        { offset: .75, transform: 'translateY(-100%)', opacity: '0' },
        { offset: 1, transform: 'translateY(0)', opacity: '1' },
      ]);

    this.animation = this.animationCtrl.create()
      .addElement(this.baseEl.querySelector('.drawer'))
      .duration(1000)
      .fromTo('height', '50px', `${this.MAX_TRANSLATE}px`)
      .addAnimation([this.animationMinifed, this.animationImg]);

    this.gesture = this.gestureCtrl.create({
      el: this.baseEl,
      threshold: 10,
      direction: 'y',
      gesturePriority: 105,
      gestureName: 'player-footer-swipe',
      onStart: () => { console.log() },
      onMove: ev => this.onMove(ev),
      onEnd: ev => this.onEnd(ev)
    })

    this.gesture.enable(true);
  }

  private onMove(ev) {
    if (!this.started) {
      this.animation.progressStart();
      this.started = true;
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

    this.animation.progressEnd((shouldComplete) ? 1 : 0, step).onFinish(() => {
      this.gesture.enable(true);
    });

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

  start(track: Track) {
    console.log('trigger start');
    if (this.player) {
      this.player.stop();
    }
    console.log(track.url);

    this.player = new Howl({
      src: [track.url],
      format: ['webm'],
      html5: true,
      volume: 0.5,
      onplay: () => {
        console.log('playing..');
        this.isPlaying = true;
        this.activeTrack = track;
        this.updateProgress();
      },
      onend: () => { },
    });
    this.player.play();
    console.log(this.player);
  }

  togglePlay(pause: boolean) {
    this.isPlaying = !pause;
    if (pause) this.player.pause();
    else this.player.play();
  }

  prev() {
    let index = this.playlist.indexOf(this.activeTrack);
    if (index > 0) this.start(this.playlist[index - 1]);
    else this.start(this.playlist[this.playlist.length - 1]);
  }

  next() {
    let index = this.playlist.indexOf(this.activeTrack);
    if (index != this.playlist.length - 1) this.start(this.playlist[index + 1]);
    else this.start(this.playlist[0]);
  }

  seek(ev) {
    // console.log(ev.detail);
    this.player.seek(this.player.duration() * (ev.detail.value / 100));
  }

  updateProgress() {
    let seek = this.player.seek();
    this.progress = (seek / this.player.duration()) * 100 || 0;
    setTimeout(() => {
      this.updateProgress();
    }, 1000);
  }

}
