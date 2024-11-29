import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../date-picker/date-picker.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent,
    DatePickerComponent
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    DatePickerComponent
  ]
})
export class MainModule { }
