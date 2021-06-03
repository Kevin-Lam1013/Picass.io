// form: source: https://www.youtube.com/watch?v=JeeUY6WaXiA
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { Drawing } from '@common/drawing.interface';
import { ObjectID } from 'bson';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
    drawingForm: FormGroup;
    MIN_NAME_LENGTH: number = 5;
    MAX_NAME_LENGTH: number = 10;
    MAX_TAGS_NUMBER: number = 3;
    isLoading: boolean = false;
    closeWindow: boolean = false;

    constructor(
        private builder: FormBuilder,
        private toolManager: ToolManagerService,
        private indexService: IndexService,
        private drawingService: DrawingService,
    ) {}

    ngOnInit(): void {
        this.drawingForm = this.builder.group({
            name: ['', [Validators.required, Validators.minLength(this.MIN_NAME_LENGTH), Validators.maxLength(this.MAX_NAME_LENGTH)]],
            tags: this.builder.array([]),
        });
    }

    get tagsForms(): FormArray {
        return this.drawingForm.get('tags') as FormArray;
    }

    addTags(): void {
        if (this.tagsForms.length < this.MAX_TAGS_NUMBER) {
            const tag = this.builder.group({
                tag: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
            });

            this.tagsForms.push(tag);
        }
    }

    removeTags(): void {
        if (this.tagsForms.length > 0) {
            this.tagsForms.removeAt(this.tagsForms.length - 1);
        }
    }

    get name(): FormGroup {
        return this.drawingForm.get('name') as FormGroup;
    }

    // direct source : https://stackoverflow.com/questions/12168909/blob-from-dataurl
    dataURItoBlob(dataURI: string): Blob {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        const byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        const ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        const blob = new Blob([ab], { type: mimeString });
        return blob;
    }

    save(): void {
        this.isLoading = true;

        const generatedID = new ObjectID();
        const temp: Drawing = { _id: generatedID.toString(), name: this.drawingForm.get('name')?.value, tags: [] };

        for (let i = 0; i < this.tagsForms.length; i++) {
            temp.tags.push(this.tagsForms.at(i).value as string);
        }

        this.indexService.basicPost(temp).subscribe();

        const drawing = new FormData();

        drawing.append('drawing', this.dataURItoBlob(this.drawingService.canvas.toDataURL()), temp._id + '.png');

        this.indexService.saveDrawingFile(drawing).subscribe(
            (formData: FormData) => {
                this.isLoading = false;
            },
            (error: Error) => {
                if (error.message === 'Http failure response for http://localhost:3000/api/index/savedDrawings: 0 Unknown Error') {
                    alert("Il y a eu un problème avec l'envoi du dessin! Connectez-vous au serveur!");
                    this.isLoading = false;
                } else {
                    alert('Votre dessin a été sauvegardé!');
                    this.isLoading = false;
                }
            },
        );
    }

    disableShortcut(): void {
        this.toolManager.allowKeyPressEvents = false;
    }

    enableShortcut(): void {
        this.toolManager.allowKeyPressEvents = true;
    }
}
