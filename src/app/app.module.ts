import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { QueryBuilderModule } from "angular2-query-builder";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import {
  MatButtonModule,
  MatCheckboxModule,
  MatSelectModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRadioModule,
  MatIconModule,
  MatCardModule,
  MatTableModule,
  MatTreeModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatTreeModule,
    QueryBuilderModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
