import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CodeEditorComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  bootstrap: [CodeEditorComponent],
})
export class AppModule {}
