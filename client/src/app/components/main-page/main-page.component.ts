import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { IndexService } from '@app/services/index/index.service';
import { Drawing } from '@common/drawing.interface';
import { ShortcutInput } from 'ng-keyboard-shortcuts';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    shortcuts: ShortcutInput[] = [];

    constructor(private basicService: IndexService, public modal: MatDialog) {
        // source de la librairie utilisee: https://www.npmjs.com/package/ng-keyboard-shortcuts
        this.shortcuts.push({
            key: 'ctrl + g',
            preventDefault: true,
            command: () => this.openCarousel(),
        });
    }

    openCarousel(): void {
        this.modal.open(CarrouselComponent);
    }

    sendTimeToServer(drawing: Drawing): void {
        this.basicService.basicPost(drawing).subscribe();
    }
}
