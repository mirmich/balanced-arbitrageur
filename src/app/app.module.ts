import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { PairListComponent } from './pair-list/pair-list.component';
import { BotBarComponent } from './bot-bar/bot-bar.component';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpClientModule],
  declarations: [
    AppComponent,
    HelloComponent,
    TopBarComponent,
    PairListComponent,
    BotBarComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
