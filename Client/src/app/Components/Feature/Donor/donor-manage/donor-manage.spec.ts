import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonorManage } from './donor-manage';

describe('DonorManage', () => {
  let component: DonorManage;
  let fixture: ComponentFixture<DonorManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonorManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonorManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
