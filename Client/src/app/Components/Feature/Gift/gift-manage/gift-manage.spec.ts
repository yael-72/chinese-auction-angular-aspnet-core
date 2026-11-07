import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftManage } from './gift-manage';

describe('GiftManage', () => {
  let component: GiftManage;
  let fixture: ComponentFixture<GiftManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
