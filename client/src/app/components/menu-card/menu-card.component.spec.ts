import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MenuComponent } from '@app/components/menu/menu.component';
import { MenuCardComponent } from './menu-card.component';

describe('MenuCardComponent', () => {
    let component: MenuCardComponent;
    let fixture: ComponentFixture<MenuCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MenuCardComponent, MenuCardComponent, MenuComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: MatDialog, useValue: {} }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
