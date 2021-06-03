import { TestBed } from '@angular/core/testing';

import { StampCommandService } from './stamp-command.service';

describe('StampCommandService', () => {
    let service: StampCommandService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StampCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
