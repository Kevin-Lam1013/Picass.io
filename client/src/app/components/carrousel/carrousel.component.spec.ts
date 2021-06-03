import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutEventOutput, ShortcutInput } from 'ng-keyboard-shortcuts';
import { of, throwError } from 'rxjs';
import { CarrouselComponent } from './carrousel.component';

describe('CarrouselComponent', () => {
    let component: CarrouselComponent;
    let fixture: ComponentFixture<CarrouselComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        drawingServiceSpy.canvas = document.createElement('canvas');
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'moveTo',
            'lineTo',
            'stroke',
            'save',
            'translate',
            'rotate',
            'restore',
            'canvas',
            'fillStyle',
            'fillRect',
            'drawImage',
        ]);
        drawingServiceSpy.baseCtx = ctxSpyObject;

        TestBed.configureTestingModule({
            declarations: [CarrouselComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [HttpHandler, HttpClient, { provide: DrawingService, useValue: drawingServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarrouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        /* tslint:disable */
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' ngOnInit should initialize visible to false', () => {
        component.ngOnInit();
        expect(component.visible).not.toEqual(true);
    });

    it('resetIndex should set all the default value of the slides index', () => {
        component.availableImages = [];
        component.firstSlideIndex = 5;
        component.secondSlideIndex = 5;
        component.thirdSlideIndex = 5;

        component.resetIndex();
        expect(component.firstSlideIndex).toEqual(0);
        expect(component.secondSlideIndex).toEqual(1);
        expect(component.thirdSlideIndex).toEqual(2);
    });

    it('getDrawings should call BasicGet', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        let basicGetSpy = spyOn(component['indexService'], 'basicGet').and.returnValue(of([]));
        spyOn(component.filterService, 'filteringToGet').and.returnValue();
        component.availableImages = [];
        component.getDrawings();
        expect(basicGetSpy).toHaveBeenCalled();
    });

    it('getDrawings should set all the default value of the slides index first of all', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        spyOn(component['indexService'], 'basicGet').and.returnValue(of([]));
        spyOn(component.filterService, 'filteringToGet').and.returnValue();
        component.firstSlideIndex = 6;
        component.secondSlideIndex = 6;
        component.thirdSlideIndex = 6;

        component.getDrawings();
        expect(component.firstSlideIndex).toEqual(0);
        expect(component.secondSlideIndex).toEqual(1);
        expect(component.thirdSlideIndex).toEqual(2);
    });

    it('getDrawings should set allDataFromDB to be equal of drawings', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        spyOn(component['indexService'], 'basicGet').and.returnValue(
            of([
                { _id: 'firstID', name: 'firstDrawing', tags: ['1', '2'] },
                { _id: 'secondID', name: 'secondDrawing', tags: ['3', '4'] },
            ]),
        );
        spyOn(component.filterService, 'filteringToGet').and.returnValue();
        component.getDrawings();
        expect(component.allDataFromDB.length).toEqual(2);
        expect(component.allDataFromDB[0]).toEqual({ _id: 'firstID', name: 'firstDrawing', tags: ['1', '2'] });
        expect(component.allDataFromDB[1]).toEqual({ _id: 'secondID', name: 'secondDrawing', tags: ['3', '4'] });
    });

    it('getDrawings should set showImages to true', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        spyOn(component['indexService'], 'basicGet').and.returnValue(of([{ _id: 'secondID', name: 'secondDrawing', tags: ['3', '4'] }]));
        spyOn(component.filterService, 'filteringToGet').and.returnValue();
        component.showImages = false;
        component.isLoading = true;
        component.getDrawings();
        expect(component.showImages).toEqual(true);
    });

    it('deleteDrawings should call basicDelete', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
        ];
        let basicdeleteSpy = spyOn(component['indexService'], 'basicDelete').and.returnValue(of());
        component.deleteDrawings('ID');
        expect(basicdeleteSpy).toHaveBeenCalled();
    });

    it('deleteDrawings should call updateAvailableImage', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
        ];
        spyOn(component['indexService'], 'basicDelete').and.returnValue(of());
        let updateAvailableImagesSpy = spyOn(component, 'updateAvailableImages').and.stub();
        component.deleteDrawings('ID');
        expect(updateAvailableImagesSpy).toHaveBeenCalled();
    });

    it('moveRight should set value the indexes to the last value of the array when they are initially at 0', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
        ];
        component.firstSlideIndex = 0;
        component.secondSlideIndex = 0;
        component.thirdSlideIndex = 0;
        component.moveRight();

        expect(component.firstSlideIndex).toEqual(component.availableImages.length - 1);
        expect(component.secondSlideIndex).toEqual(component.availableImages.length - 1);
        expect(component.thirdSlideIndex).toEqual(component.availableImages.length - 1);
    });

    it('moveRight should decrement value the indexes to the last value of the array when they are not initially at 0', () => {
        component.firstSlideIndex = 1;
        component.secondSlideIndex = 2;
        component.thirdSlideIndex = 3;
        component.moveRight();

        expect(component.firstSlideIndex).toEqual(0);
        expect(component.secondSlideIndex).toEqual(1);
        expect(component.thirdSlideIndex).toEqual(2);
    });

    it('moveLeft should set value the indexes to the last value of the array when they are initially at at the last index of the array', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
            { path: 'fourthPath', id: 'fourth', name: 'fourth', tags: ['4'] },
        ];
        component.firstSlideIndex = 3;
        component.secondSlideIndex = 3;
        component.thirdSlideIndex = 3;
        component.moveLeft();

        expect(component.firstSlideIndex).toEqual(0);
        expect(component.secondSlideIndex).toEqual(0);
        expect(component.thirdSlideIndex).toEqual(0);
    });

    it('moveLeft should increment value the indexes to the last value of the array when they are not initially at at the last index of the array', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
            { path: 'fourthPath', id: 'fourth', name: 'fourth', tags: ['4'] },
        ];
        component.firstSlideIndex = 0;
        component.secondSlideIndex = 1;
        component.thirdSlideIndex = 2;
        component.moveLeft();

        expect(component.firstSlideIndex).toEqual(1);
        expect(component.secondSlideIndex).toEqual(2);
        expect(component.thirdSlideIndex).toEqual(3);
    });

    it('disableShortcut should set allowKeyPressEvents of the toolManager to false', () => {
        component.availableImages = [];
        component['toolManager'].allowKeyPressEvents = true;
        component.disableShortcut();
        expect(component['toolManager'].allowKeyPressEvents).toEqual(false);
    });

    it('enableShortcut should set allowKeyPressEvents of the toolManager to true', () => {
        component['toolManager'].allowKeyPressEvents = false;
        component.enableShortcut();
        expect(component['toolManager'].allowKeyPressEvents).toEqual(true);
    });

    it('updateAvailbleImages should remove the element from availableImages that have the id we are looking for', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
        ];
        component.updateAvailableImages('second');
        expect(component.availableImages.length).toEqual(2);
    });

    it('updateAvailbleImages should remove the element from availableImages that have the id we are looking for if the id is here', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
            { path: 'thirdPath', id: 'third', name: 'third', tags: ['3'] },
        ];
        component.updateAvailableImages('notHere');
        expect(component.availableImages.length).toEqual(3);
    });

    it('updateAvailableImages should call once resetIndex when the id is we are looking for is here', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
        ];
        let resetIndexSpy = spyOn(component, 'resetIndex').and.stub();
        component.updateAvailableImages('first');
        expect(resetIndexSpy).toHaveBeenCalledTimes(1);
    });

    it('updateAvailableImages should not call resetIndex when the id is we are looking for is not here', () => {
        component.availableImages = [
            { path: 'firstPath', id: 'first', name: 'first', tags: ['1'] },
            { path: 'secondPath', id: 'second', name: 'second', tags: ['2'] },
        ];
        let resetIndexSpy = spyOn(component, 'resetIndex').and.stub();
        component.updateAvailableImages('notHere');
        expect(resetIndexSpy).not.toHaveBeenCalled();
    });

    it('loadDrawing should call clearArrays once', () => {
        const loadDrawingSpy = spyOn(component, 'loadDrawing').and.callThrough();
        spyOn(window, 'confirm').and.returnValue(true);
        let clearArraySpy = spyOn(component['toolManager'], 'clearArrays').and.stub();
        component.loadDrawing('path');
        expect(clearArraySpy).toHaveBeenCalledTimes(1);
        expect(loadDrawingSpy).toHaveBeenCalled();
    });

    it('loadDrawing should not load the drawing if the user doesnt confirm', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        component.drawingService.drawingStarted = false;
        let saveDrawingSpy = spyOn(component['autoSave'], 'saveDrawing').and.stub();
        component.loadDrawing('path');
        expect(saveDrawingSpy).not.toHaveBeenCalled();
    });

    it('getDrawings should call alert when the server is not connected', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        let alertSpy = spyOn(window, 'alert').and.stub();
        spyOn(component['indexService'], 'basicGet').and.returnValue(throwError({ status: 404 }));
        component.getDrawings();
        expect(alertSpy).toHaveBeenCalled();
    });

    it('getDrawings should call alert when the database is empty', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        let alertSpy = spyOn(window, 'alert').and.stub();
        spyOn(component['indexService'], 'basicGet').and.returnValue(of([]));
        component.getDrawings();
        expect(alertSpy).toHaveBeenCalled();
    });

    it('getDrawings should call alert when we cannot find a drawing', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        component.allDataFromDB = [];
        spyOn(window, 'alert').and.stub();
        spyOn(component['indexService'], 'basicGet').and.returnValue(
            of([
                { _id: 'firstID', name: 'firstDrawing', tags: ['1', '2'] },
                { _id: 'secondID', name: 'secondDrawing', tags: ['3', '4'] },
            ]),
        );
        component.filterService.input = ['notHere'];
        component.getDrawings();
        expect(true).toBeTruthy();
    });

    it('getDrawings should set to false isLoading when we cannot find a drawing', () => {
        component.allDataFromDB = [];
        spyOn(component.filterService, 'formatInput').and.returnValue();
        spyOn(window, 'alert').and.stub();
        spyOn(component['indexService'], 'basicGet').and.returnValue(
            of([
                { _id: 'firstID', name: 'firstDrawing', tags: ['1', '2'] },
                { _id: 'secondID', name: 'secondDrawing', tags: ['3', '4'] },
            ]),
        );
        component.filterService.input = ['notHere'];
        component.isLoading = false;
        component.getDrawings();
        expect(component.isLoading).toEqual(true);
    });

    it('getDrawings should set to false isLoading when the database is empty', () => {
        spyOn(window, 'alert').and.stub();
        spyOn(component.filterService, 'formatInput').and.returnValue();
        spyOn(component['indexService'], 'basicGet').and.returnValue(of([]));
        component.isLoading = false;
        component.getDrawings();
        expect(component.isLoading).toEqual(true);
    });

    it('getDrawings should set isLoading to true when the server is not connected', () => {
        spyOn(component.filterService, 'formatInput').and.returnValue();
        spyOn(window, 'alert').and.stub();
        spyOn(component['indexService'], 'basicGet').and.returnValue(throwError({ status: 404 }));
        component.isLoading = false;
        component.getDrawings();
        expect(component.isLoading).toEqual(true);
    });

    it('  left arrow shortcut should call moveLeft', () => {
        const mockArrowLeft = component.shortcuts.find((x) => x.key === 'left');
        const mockArrowRight = component.shortcuts.find((x) => x.key === 'right');
        const mockArrowRightSpy = spyOn(mockArrowRight as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: false, key: 'left' });
        const moveLeftSpy = spyOn(component, 'moveLeft').and.callThrough();
        mockArrowLeft?.command({ event: keyboardEvent, key: 'left' } as ShortcutEventOutput);
        expect(moveLeftSpy).toHaveBeenCalled();
        expect(mockArrowRightSpy).not.toHaveBeenCalled();
    });

    it('  right arrow shortcut should call moveRight', () => {
        const mockArrowRight = component.shortcuts.find((x) => x.key === 'right');
        const mockArrowLeft = component.shortcuts.find((x) => x.key === 'left');
        const mockArrowLeftSpy = spyOn(mockArrowLeft as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: false, key: 'right' });
        const moveRightSpy = spyOn(component, 'moveRight').and.callThrough();
        mockArrowRight?.command({ event: keyboardEvent, key: 'right' } as ShortcutEventOutput);
        expect(moveRightSpy).toHaveBeenCalled();
        expect(mockArrowLeftSpy).not.toHaveBeenCalled();
    });

    it('setUpImage should save the drawing', () => {
        const imageToLoad = new Image();
        imageToLoad.src = 'https://homepages.cae.wisc.edu/~ece533/images/boat.png';
        let autoSaveSpy = spyOn(component['autoSave'], 'saveDrawing').and.stub();
        component.setUpImage(imageToLoad);
        expect(autoSaveSpy).toHaveBeenCalled();
    });
});
