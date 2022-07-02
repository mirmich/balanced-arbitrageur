import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { PairListComponent } from './pair-list/pair-list.component';
import { BotBarComponent } from './bot-bar/bot-bar.component';
import { TopTradesComponent } from './top-trades/top-trades.component';
import { EdgeGroomingPipePipe } from './top-trades/edge-grooming-pipe.pipe';
import {
  IgxDropDownModule,
  IgxButtonModule,
  IgxToggleModule,
} from 'igniteui-angular';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    IgxDropDownModule,
    IgxButtonModule,
    IgxToggleModule,
  ],
  declarations: [
    AppComponent,
    HelloComponent,
    TopBarComponent,
    PairListComponent,
    TopTradesComponent,
    BotBarComponent,
    EdgeGroomingPipePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
