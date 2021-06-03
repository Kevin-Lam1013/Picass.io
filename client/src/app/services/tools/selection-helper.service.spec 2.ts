import { TestBed } from '@angular/core/testing';

import { SelectionHelperService } from './selection-helper.service';

describe('SelectionHelperService', () => {
    let service: SelectionHelperService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
