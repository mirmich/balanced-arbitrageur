import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { PairListComponent } from './pair-list/pair-list.component';
import { TopTradesComponent } from './top-trades/top-trades.component';
import { EdgeGroomingPipePipe } from './top-trades/edge-grooming-pipe.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShortenAddressPipe } from './top-bar/shorten-address.pipe';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    PairListComponent,
    TopTradesComponent,
    EdgeGroomingPipePipe,
    ShortenAddressPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
