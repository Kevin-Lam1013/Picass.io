import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- NgModel lives here
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExportDrawingComponent } from '@app/components/export-drawing/export-drawing.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributesBarComponent } from './components/attributes/attributes-bar/attributes-bar.component';
import { CarrouselComponent } from './components/carrousel/carrousel.component';
import { ColorPaletteComponent } from './components/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ColorSliderComponent } from './components/color-picker/color-slider/color-slider.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { FormComponent } from './components/form/form.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { MenuComponent } from './components/menu/menu.component';
import { PipetteComponent } from './components/pipette/pipette.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        MenuComponent,
        MenuCardComponent,
        CarrouselComponent,
        ToolbarComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        ColorPickerComponent,
        ExportDrawingComponent,
        PipetteComponent,
        FormComponent,
        AttributesBarComponent,
    ],
    imports: [
        BrowserModule,
        ScrollingModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatListModule,
        MatCardModule,
        MatDividerModule,
        FontAwesomeModule,
        MatSliderModule,
        FormsModule,
        MatRadioModule,
        MatButtonToggleModule,
        MatTooltipModule,
        MatDialogModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        KeyboardShortcutsModule.forRoot(),
        MatButtonModule,
        MatMenuModule,
        MatSnackBarModule,
        MatSlideToggleModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
