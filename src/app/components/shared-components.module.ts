import { PlayerComponent } from './player/player.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PlayerFooterComponent } from './player-footer/player-footer.component';



@NgModule({
  declarations: [PlayerComponent, PlayerFooterComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [PlayerComponent, PlayerFooterComponent]
})
export class SharedComponentsModule { }
