import { TestBed } from '@angular/core/testing';
import { ColorService } from '@app/services/tools/color.service';

describe('ColorService', () => {
    let service: ColorService;

    beforeEach(() => {
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count

        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setPrimaryColorWithOpacity updates the opacity of the primary color', () => {
        service.primaryColorPreview = 'rgba(255,255,255,1)';
        service.setPrimaryColorWithOpacity(0.5);
        expect(service.primaryColorPreview).toEqual('rgba(255,255,255,0.5)');
    });

    it('setSecondary ColorWithOpacity updates the opacity of the secondary color', () => {
        service.secondaryColorPreview = 'rgba(255,255,255,1)';
        service.setSecondaryColorWithOpacity(0.5);
        expect(service.secondaryColorPreview).toEqual('rgba(255,255,255,0.5)');
    });

    it('swapPrimaryAndSecondary inverts the primary and the secondary colors', () => {
        service.primaryColorPreview = 'rgba(0,0,0,1)';
        service.secondaryColorPreview = 'rgba(255,255,255,1)';
        service.swapPrimaryAndSecondary();
        expect(service.primaryColorPreview).toEqual('rgba(255,255,255,1)');
        expect(service.secondaryColorPreview).toEqual('rgba(0,0,0,1)');
    });

    it('setColorWithOpacity should return the right string with color and opacity', () => {
        const mockColor = 'rgba(1,2,3,4)';
        const mockOpacity = 1;
        const expectedResult = 'rgba(1,2,3,1)';
        const result = service.setColorWithOpacity(mockColor, mockOpacity);
        expect(result).toEqual(expectedResult);
    });

    it('resetValuesOnCancel correctly sets the right values', () => {
        service.primaryColorPreview = 'rgba(0,0,0,0)';
        service.primaryColor = 'rgba(1,1,1,1)';
        service.secondaryColorPreview = 'rgba(1,2,3,4)';
        service.secondaryColor = 'rgba(1,1,1,2)';
        service.primaryOpacityPreview = 2;
        service.primaryOpacity = 1;
        service.secondaryOpacityPreview = 3;
        service.secondaryOpacity = 4;

        service.resetValuesOnCancel();

        expect(service.primaryColorPreview).toEqual(service.primaryColor);
        expect(service.secondaryColorPreview).toEqual(service.secondaryColor);
        expect(service.primaryOpacityPreview).toEqual(service.primaryOpacity);
        expect(service.secondaryOpacityPreview).toEqual(service.secondaryOpacity);
    });

    it('setValuesOnConfirm calls setColorWithOpacity 4 times', () => {
        const setColorWithOpacitySpy = spyOn(service, 'setColorWithOpacity').and.stub();
        service.setValuesOnConfirm();
        expect(setColorWithOpacitySpy).toHaveBeenCalledTimes(4);
    });

    it('setValuesOnConfirm calls pushToQueueOnConfirm 2 times if both ifs are true', () => {
        const pushToQueueOnConfirmSpy = spyOn(service, 'pushToQueueOnConfirm').and.stub();
        service.primaryColor = 'rgba(1,1,1,1)';
        service.primaryColorPreview = 'rgba(1,2,3,1)';
        service.secondaryColor = 'rgba(1,1,1,1)';
        service.secondaryColorPreview = 'rgba(1,2,3,1)';

        service.setValuesOnConfirm();
        expect(pushToQueueOnConfirmSpy).toHaveBeenCalledTimes(2);
    });

    it('setValuesOnConfirm calls pushToQueueOnConfirm once if only 1st if is true', () => {
        const pushToQueueOnConfirmSpy = spyOn(service, 'pushToQueueOnConfirm').and.stub();
        service.primaryColor = 'rgba(1,1,1,1)';
        service.primaryColorPreview = 'rgba(1,1,1,1)';
        service.secondaryColor = 'rgba(1,1,1,1)';
        service.secondaryColorPreview = 'rgba(1,2,3,1)';

        service.setValuesOnConfirm();
        expect(pushToQueueOnConfirmSpy).toHaveBeenCalledTimes(1);
    });

    it('setValuesOnConfirm calls pushToQueueOnConfirm once if only 2nd if is true', () => {
        const pushToQueueOnConfirmSpy = spyOn(service, 'pushToQueueOnConfirm').and.stub();

        service.primaryColor = 'rgba(1,1,1,1)';
        service.primaryColorPreview = 'rgba(1,2,1,1)';
        service.secondaryColor = 'rgba(1,1,1,1)';
        service.secondaryColorPreview = 'rgba(1,1,1,1)';

        service.setValuesOnConfirm();
        expect(pushToQueueOnConfirmSpy).toHaveBeenCalledTimes(1);
    });

    it('contains should call toArray once', () => {
        const toArraySpy = spyOn(service.tenLastUsedColors, 'toArray').and.callThrough();
        const color = 'black' as string;
        service.contains(color);
        expect(toArraySpy).toHaveBeenCalledTimes(1);
    });

    it('contains should return false if there is nothing in tenLastUsedColors', () => {
        const color = 'grey' as string;
        expect(service.contains(color)).toEqual(false);
    });

    it('contains should return true when the last color in the queue of string is blue', () => {
        const color = 'blue' as string;
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('red');
        service.tenLastUsedColors.append('blue');
        expect(service.contains(color)).toEqual(true);
    });

    it('contains should return true when the color grey is in the middle of the queue of string', () => {
        const color = 'grey' as string;
        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('red');
        expect(service.contains(color)).toEqual(true);
    });

    it('contains should return true when the color yellow is at the start of the queue of string', () => {
        const color = 'yellow' as string;
        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('red');
        expect(service.contains(color)).toEqual(true);
    });

    it('pushToQueueOnConfirm should call append once when tenLastUsedColors does not have the color grey', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('red');

        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();

        service.pushToQueueOnConfirm(color);
        expect(appendSpy).toHaveBeenCalledTimes(1);
    });

    it('pushToQueueOnConfirm should not call dequeue when tenLastUsedColors does not contains the color grey and the queue of string have only 3 color initially', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');

        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();
        service.pushToQueueOnConfirm(color);
        expect(dequeueSpy).not.toHaveBeenCalled();
    });

    it('pushToQueueOnConfirm should call dequeue once when tenLastUsedColors does not contains the color purple and the queue lenght is equal than MAX_NUMBER_IN_LIST_OF_LAST_USED', () => {
        const color = 'purple' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('orange');
        service.tenLastUsedColors.append('pink');
        service.tenLastUsedColors.append('white');
        service.tenLastUsedColors.append('green');
        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('gold');
        service.tenLastUsedColors.append('navy');

        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();
        service.pushToQueueOnConfirm(color);
        expect(dequeueSpy).toHaveBeenCalledTimes(1);
    });

    it('pushToQueueOnConfirm should not call remove, append and dequeue when tenLastUsedColors have the color grey and the queue of string only have the color grey initially', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('grey');

        const removeSpy = spyOn(service.tenLastUsedColors, 'remove').and.callThrough();
        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();
        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();
        service.pushToQueueOnConfirm(color);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(appendSpy).not.toHaveBeenCalled();
        expect(dequeueSpy).not.toHaveBeenCalled();
    });

    it('pushToQueueOnConfirm should not call remove, append and dequeue when tenLastUsedColors have the color grey and the queue of string only have the color grey initially', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('white');

        const removeSpy = spyOn(service.tenLastUsedColors, 'remove').and.callThrough();
        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();
        service.pushToQueueOnConfirm(color);
        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(appendSpy).toHaveBeenCalledTimes(1);
    });

    it('pushToQueueOnConfirm should call remove, append and dequeue once when tenLastUsedColors contains grey and the queue length is equal to MAX_NUMBER_IN_LIST_OF_LAST_USED', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('orange');
        service.tenLastUsedColors.append('pink');
        service.tenLastUsedColors.append('white');
        service.tenLastUsedColors.append('green');
        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('gold');
        service.tenLastUsedColors.append('navy');
        service.tenLastUsedColors.append('silver');

        const removeSpy = spyOn(service.tenLastUsedColors, 'remove').and.callThrough();
        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();
        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();

        service.pushToQueueOnConfirm(color);

        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(appendSpy).toHaveBeenCalledTimes(1);
        expect(dequeueSpy).toHaveBeenCalledTimes(1);
    });

    it('pushToQueueOnConfirm should call remove and append once when tenLastUsedColors contains grey and the queue length is lower to MAX_NUMBER_IN_LIST_OF_LAST_USED but greater than 1', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('grey');

        const removeSpy = spyOn(service.tenLastUsedColors, 'remove').and.callThrough();
        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();

        service.pushToQueueOnConfirm(color);

        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(appendSpy).toHaveBeenCalledTimes(1);
    });

    it('pushToQueueOnConfirm should not call dequeue when tenLastUsedColors contains grey and the queue length is lower to MAX_NUMBER_IN_LIST_OF_LAST_USED but greater than 1', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('orange');
        service.tenLastUsedColors.append('pink');
        service.tenLastUsedColors.append('white');
        service.tenLastUsedColors.append('green');
        service.tenLastUsedColors.append('grey');
        service.tenLastUsedColors.append('gold');
        service.tenLastUsedColors.append('navy');

        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();

        service.pushToQueueOnConfirm(color);

        expect(dequeueSpy).not.toHaveBeenCalled();
    });

    it('pushToQueueOnConfirm should not call dequeue but should call remove and append once when tenLastUsedColors contains grey and the queue length is equal to MAX_NUMBER_IN_LIST_OF_LAST_USED', () => {
        const color = 'grey' as string;

        service.tenLastUsedColors.append('yellow');
        service.tenLastUsedColors.append('black');
        service.tenLastUsedColors.append('blue');
        service.tenLastUsedColors.append('grey');

        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();
        const removeSpy = spyOn(service.tenLastUsedColors, 'remove').and.callThrough();
        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();

        service.pushToQueueOnConfirm(color);

        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(appendSpy).toHaveBeenCalledTimes(1);
        expect(dequeueSpy).not.toHaveBeenCalled();
    });

    it(' pushToQueueOnConfirm append with color if the length of tenLastUsedColors is strictly larger than 1', () => {
        const appendSpy = spyOn(service.tenLastUsedColors, 'append').and.callThrough();
        Object.defineProperty(service.tenLastUsedColors, 'length', { value: 3 });
        service.pushToQueueOnConfirm('rgba(100,0,42,1)');
        expect(appendSpy).toHaveBeenCalledWith('rgba(100,0,42,1)');
    });

    it(' pushToQueueOnConfirm should call dequeue if the length of tenLastUsedColors is strictly larger than 10', () => {
        const dequeueSpy = spyOn(service.tenLastUsedColors, 'dequeue').and.callThrough();
        Object.defineProperty(service.tenLastUsedColors, 'length', { value: 25 });
        service.pushToQueueOnConfirm('rgba(100,0,42,1)');
        expect(dequeueSpy).toHaveBeenCalled();
    });

    it(' onLeftClickPreviousColor should affect primaryColorPreview with color and call both setPrimaryColorWithOpacity and pushToQueueOnConfirm if contextmenu is false and mouseDown is true', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service['mouseDown'] = true;
        const setPrimaryColorWithOpacitySpy = spyOn(service, 'setPrimaryColorWithOpacity').and.callThrough();
        const pushToQueueOnCOnfirmSpy = spyOn(service, 'pushToQueueOnConfirm').and.callThrough();
        service.onLeftClickPreviousColor(mouseEventLClick, 'rgba(0,0,42,1)');
        expect(service.primaryColorPreview).toEqual('rgba(0,0,42,1)');
        expect(setPrimaryColorWithOpacitySpy).toHaveBeenCalledWith(service.primaryOpacityPreview);
        expect(pushToQueueOnCOnfirmSpy).toHaveBeenCalledWith('rgba(0,0,42,1)');
    });

    it(' onLeftClickPreviousColor should affect isConfirmed with false if contextmenu is false, mouseDown is true and isConfirmed is false', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        service['mouseDown'] = true;
        service.isConfirmed = true;
        service.onLeftClickPreviousColor(mouseEventLClick, 'rgba(0,0,42,1)');
        expect(service.isConfirmed).toEqual(false);
    });

    it('onLeftClickPreviousColor shouldnt set primaryColorPreview as color if mouseDown is false', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.primaryColorPreview = 'expectedResult';
        service.onLeftClickPreviousColor(mouseEventRClick, 'nonExpectedResult');
        expect(service.primaryColorPreview).toEqual('expectedResult');
    });

    it(' onRightClickPreviousColor should affect secondaryColorPreview with color and call both setSecondaryColorWithOpacity and pushToQueueOnConfirm', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        const setSecondaryColorWithOpacitySpy = spyOn(service, 'setSecondaryColorWithOpacity').and.callThrough();
        const pushToQueueOnConfirmSpy = spyOn(service, 'pushToQueueOnConfirm').and.callThrough();
        service.onRightClickPreviousColor(mouseEventLClick, 'rgba(200,72,42,1)');
        expect(service.secondaryColorPreview).toEqual('rgba(200,72,42,1)');
        expect(setSecondaryColorWithOpacitySpy).toHaveBeenCalledWith(service.secondaryOpacityPreview);
        expect(pushToQueueOnConfirmSpy).toHaveBeenCalledWith('rgba(200,72,42,1)');
    });

    it(' onRightClickPreviousColor should affect isConfirmed with false if isConfirmed is true and always return false', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.isConfirmed = true;
        service.onRightClickPreviousColor(mouseEventLClick, 'rgba(0,0,42,1)');
        expect(service.isConfirmed).toEqual(false);
        expect(service.onRightClickPreviousColor(mouseEventLClick, 'rgba(0,0,42,1)')).toEqual(false);
    });

    it(' setColor should affect primaryColor with color and call setPrimaryColorWithOpacity if primary is true', () => {
        const primary = true;
        const color = 'rgba(0,0,0,1)';
        const setPrimaryColorWithOpacitySpy = spyOn(service, 'setPrimaryColorWithOpacity').and.callThrough();
        service.setColor(primary, color);
        expect(service.primaryColor).toEqual(color);
        expect(setPrimaryColorWithOpacitySpy).toHaveBeenCalledWith(service.primaryOpacityPreview);
    });

    it(' setColor should affect secondaryColor with color and call setSecondaryColorWithOpacity if primary is false', () => {
        const primary = false;
        const color = 'rgba(0,0,0,1)';
        const setSecondaryColorWithOpacitySpy = spyOn(service, 'setSecondaryColorWithOpacity').and.callThrough();
        service.setColor(primary, color);
        expect(service.secondaryColor).toEqual(color);
        expect(setSecondaryColorWithOpacitySpy).toHaveBeenCalledWith(service.secondaryOpacityPreview);
    });

    it(' setColorPreview should affect primaryColorPreview with color and call setPrimaryColorWithOpacity if primary is true', () => {
        const primary = true;
        const color = 'rgba(0,0,0,1)';
        service.setColorPreview(primary, color);
        expect(service.primaryColorPreview).toEqual(color);
    });

    it(' setColorPreview should affect secondaryColorPreview with color and call setSecondaryColorWithOpacity if primary is false', () => {
        const primary = false;
        const color = 'rgba(0,0,0,1)';
        service.setColorPreview(primary, color);
        expect(service.secondaryColorPreview).toEqual(color);
    });

    it(' changePrimaryOpacity should affect primaryOpacityPreview with opacity', () => {
        const opacity = 50;
        service.changePrimaryOpacity(opacity);
        expect(service.primaryOpacityPreview).toEqual(50);
    });

    it(' changePrimaryOpacity should call changePrimaryOpacity with opacity', () => {
        const opacity = 50;
        const setPrimaryColorWithOpacitySpy = spyOn(service, 'setPrimaryColorWithOpacity').and.callThrough();
        service.changePrimaryOpacity(opacity);
        expect(setPrimaryColorWithOpacitySpy).toHaveBeenCalledWith(opacity);
    });

    it(' changeSecondaryOpacity should affect secondaryOpacityPreview with opacity', () => {
        const opacity = 75;
        service.changeSecondaryOpacity(opacity);
        expect(service.secondaryOpacityPreview).toEqual(75);
    });

    it(' changeSecondaryOpacity should call setSecondaryColorWithOpacity with opacity', () => {
        const opacity = 50;
        const setSecondaryColorWithOpacitySpy = spyOn(service, 'setSecondaryColorWithOpacity').and.callThrough();
        service.changeSecondaryOpacity(opacity);
        expect(setSecondaryColorWithOpacitySpy).toHaveBeenCalledWith(opacity);
    });
});
