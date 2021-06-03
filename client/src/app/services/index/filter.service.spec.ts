import { TestBed } from '@angular/core/testing';
import { Drawing } from '@app/interface/drawing-interface';
import { Image } from '@app/interface/image-interface';
import { FilterService } from '@app/services/index/filter.service';

const DRAWINGS_URL = 'http://localhost:3000/retrieve-images/';
const EXTENSION = '.PNG';

describe('FilterService', () => {
    let service: FilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FilterService);
        /* tslint:disable */
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('formatInput shout set the input to a empty array first of all', () => {
        service.tags = '';
        service.formatInput();
        expect(service.input).toEqual([]);
    });

    it('formatInput should populate the input array when tags is valid', () => {
        service.tags = 'tagUN,tagDEUX,tagTROIS';
        let inputTab = service.tags.split(',');
        service.formatInput();
        expect(service.input.length).toEqual(inputTab.length);
        for (let i = 0; i < service.input.length; i++) {
            expect(service.input[i]).toEqual(inputTab[i]);
        }
    });

    it(' extractInput should set the tags value written in textbox', () => {
        let event = {} as KeyboardEvent;
        Object.defineProperty(event, 'target', { value: { value: 'inputest' } });
        service.extractInput(event);
        expect(service.tags).toEqual('inputest');
    });

    it('isDuplicate should return false when filteredData is empty', () => {
        let filteredData: Image[] = [];
        let returnValue: boolean = service.isDuplicate(filteredData, '');
        expect(returnValue).not.toBeTrue();
    });

    it('isDuplicate should return false when the id is not found', () => {
        let filteredData: Image[] = [{ path: '', id: 'myID', name: '', tags: [] }];
        let returnValue: boolean = service.isDuplicate(filteredData, 'notMyId');
        expect(returnValue).not.toBeTrue();
    });

    it('isDUplicate should return true when the id is found', () => {
        let filteredData: Image[] = [{ path: '', id: 'myID', name: '', tags: [] }];
        let returnValue: boolean = service.isDuplicate(filteredData, 'myID');
        expect(returnValue).toBeTrue();
    });

    it('filteringToGet should add every element of data in dataFiltered when there is no input', () => {
        let data: Drawing[] = [
            { _id: 'myID', name: '', tags: [] },
            { _id: 'myID2', name: '', tags: [] },
        ];
        let filteredData: Image[] = [];
        service.tags = '';
        service.filteringToGet(data, filteredData);
        expect(filteredData.length).toEqual(2);
        for (let i = 0; i < filteredData.length; i++) {
            expect(filteredData[i]).toEqual({
                path: DRAWINGS_URL + data[i]._id.toString() + EXTENSION,
                id: data[i]._id.toString(),
                name: data[i].name,
                tags: data[i].tags,
            });
        }
    });

    it('filteringToGet should not add duplicates drawing to datafiltered', () => {
        let data: Drawing[] = [
            { _id: 'myID', name: '', tags: ['1'] },
            { _id: 'myID', name: '', tags: ['1'] },
        ];
        let filteredData: Image[] = [];
        service.tags = '1';
        service.filteringToGet(data, filteredData);
        expect(filteredData.length).toEqual(1);
    });

    it('filteringToGet should add every drawings containing the wanted tags', () => {
        let data: Drawing[] = [
            { _id: 'myID1', name: '', tags: ['1'] },
            { _id: 'myID2', name: '', tags: ['2'] },
            { _id: 'myID3', name: '', tags: ['2'] },
            { _id: 'myID4', name: '', tags: ['3'] },
        ];
        let filteredData: Image[] = [];
        service.tags = '1,2';
        service.filteringToGet(data, filteredData);
        expect(filteredData.length).toEqual(3);

        for (let i = 0; i < filteredData.length; i++) {
            expect(filteredData[i]).toEqual({
                path: DRAWINGS_URL + data[i]._id.toString() + EXTENSION,
                id: data[i]._id.toString(),
                name: data[i].name,
                tags: data[i].tags,
            });
        }
    });
});
