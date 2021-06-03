import { Injectable } from '@angular/core';
import { Drawing } from '@app/interface/drawing-interface';
import { Image } from '@app/interface/image-interface';

const TAG_VALUE_INDEX = 0;
const DRAWINGS_URL = 'http://localhost:3000/retrieve-images/';
const EXTENSION = '.PNG';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    input: string[] = [];
    tags: string = '';

    extractInput(event: KeyboardEvent): void {
        this.tags = (event.target as HTMLInputElement).value;
    }

    formatInput(): void {
        this.input = [];
        if (this.tags !== null && this.tags !== '' && typeof this.tags !== undefined) {
            let temp = '';
            for (const caracter of this.tags) {
                if (caracter === ',') {
                    this.input.push(temp);
                    temp = '';
                } else {
                    temp += caracter;
                }
            }
            this.input.push(temp);
        }
    }

    filteringToGet(data: Drawing[], dataFiltered: Image[]): void {
        this.formatInput();
        if (this.input.length === 0) {
            for (const drawing of data) {
                dataFiltered.push({
                    path: DRAWINGS_URL + drawing._id.toString() + EXTENSION,
                    id: drawing._id.toString(),
                    name: drawing.name,
                    tags: drawing.tags,
                });
            }
        } else {
            for (const input of this.input) {
                for (const drawing of data) {
                    for (const tag of drawing.tags) {
                        if (input === Object.values(tag)[TAG_VALUE_INDEX] && !this.isDuplicate(dataFiltered, drawing._id.toString())) {
                            dataFiltered.push({
                                path: DRAWINGS_URL + drawing._id.toString() + EXTENSION,
                                id: drawing._id.toString(),
                                name: drawing.name,
                                tags: drawing.tags,
                            });
                        }
                    }
                }
            }
        }
    }

    isDuplicate(filteredData: Image[], id: string): boolean {
        if (filteredData.length === 0) {
            return false;
        }

        for (const image of filteredData) {
            if (id === image.id.toString()) {
                return true;
            }
        }

        return false;
    }
}
