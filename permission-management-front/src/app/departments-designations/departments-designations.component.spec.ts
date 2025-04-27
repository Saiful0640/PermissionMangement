import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsDesignationsComponent } from './departments-designations.component';

describe('DepartmentsDesignationsComponent', () => {
  let component: DepartmentsDesignationsComponent;
  let fixture: ComponentFixture<DepartmentsDesignationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsDesignationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentsDesignationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
