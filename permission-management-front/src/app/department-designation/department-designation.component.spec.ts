import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentDesignationComponent } from './department-designation.component';

describe('DepartmentDesignationComponent', () => {
  let component: DepartmentDesignationComponent;
  let fixture: ComponentFixture<DepartmentDesignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentDesignationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentDesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
