import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Drawing } from '@common/drawing.interface';
import { IndexService } from './index.service';

describe('IndexService', () => {
    let httpMock: HttpTestingController;
    let service: IndexService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(IndexService);
        httpMock = TestBed.inject(HttpTestingController);
        // BASE_URL is private so we need to access it with its name as a key
        // Try to avoid this syntax which violates encapsulation
        // tslint:disable
        // tslint:disable:no-string-literal
        // tslint:disable:no-empty
        baseUrl = service['BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return expected Drawing (HttpClient called once)', () => {
        const expectedDrawing: Drawing = { _id: 'id', name: 'name', tags: [] };
        // check the content of the mocked call
        service.basicGet().subscribe((response: Drawing[]) => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/drawing');
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedDrawing);
    });

    it('should not return any Drawing when sending a POST request (HttpClient called once)', () => {
        const sentDrawing: Drawing = { _id: 'id', name: 'name', tags: [] };
        // subscribe to the mocked call
        // tslint:disable-next-line: no-empty
        service.basicPost(sentDrawing).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/send');
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentDrawing);
    });

    it('should not return any Drawing when sending a DELETE request (HttpClient called once)', () => {
        // subscribe to the mocked call
        // tslint:disable-next-line: no-empty
        service.basicDelete('MyID').subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/drawing/MyID');
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });
});
