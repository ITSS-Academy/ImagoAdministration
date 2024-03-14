import {
  AfterViewInit,
  Component, HostBinding,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {SharedModule} from '../../../../shared/shared.module';
import {
  IconService,
  PaginationModel,
  TableHeaderItem,
  TableItem,
  TableModel,
} from 'carbon-components-angular';
import Filter20 from '@carbon/icons/es/filter/20';
import TrashCan20 from '@carbon/icons/es/trash-can/20';
import Close20 from '@carbon/icons/es/close/20';
import Edit20 from '@carbon/icons/es/edit/20';
import {AsyncPipe, NgClass} from '@angular/common';
import {RoleCategoryComponent} from './components/role-category/role-category.component';
import {FormControl, FormGroup} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {RoleState} from '../../../../ngrx/role/role.state';
import {Store} from '@ngrx/store';
import * as RoleActions from '../../../../ngrx/role/role.actions';
import {Subscription} from 'rxjs';
import {AuthState} from '../../../../ngrx/auth/auth.state';
import {RoleModel} from "../../../../models/role.model";

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    SharedModule,
    NgClass,
    RoleCategoryComponent,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss',
})
export class RoleManagementComponent
  implements OnInit, OnChanges, AfterViewInit {
  constructor(
    protected iconService: IconService,
    private store: Store<{ role: RoleState; auth: AuthState }>
  ) {
    this.iconService.registerAll([Filter20, TrashCan20, Close20, Edit20]);
  }

  subscription: Subscription[] = [];
  token = '';
  page = 1;
  numberSize = 10;

  ngOnInit(): void {
    this.subscription.push(
      this.store.select('auth', 'idToken').subscribe((token) => {
        if (token != '') {
          this.token = token
          this.store.dispatch(
            RoleActions.getAllRole({
              token: token,
              page: this.page,
              size: this.numberSize,
            }),
          );
        }
      })
    );
    this.roles$.subscribe((roleList) => {
      this.dataSet = roleList.data.map((role) => [
        new TableItem({
          data: role.id,
        }),
        new TableItem({
          data: role.name,
        }),
        new TableItem({
          data: role.description,
        }),
      ]);
      this.model.data = this.dataSet;
      this.modelPagination.totalDataLength = roleList.endPage;
    });

    this.model.header = [
      new TableHeaderItem({data: 'Id'}),
      new TableHeaderItem({data: 'Name'}),
      new TableHeaderItem({data: 'Describe'}),
    ];

    this.modelPagination.currentPage = 1;
  }

  ngOnChanges(): void {
  }

  ngAfterViewInit() {
  }

  roles$ = this.store.select((state) => state.role.roleList);
  loading$ = this.store.select((state) => state.role.isLoading);
  error$ = this.store.select((state) => state.role.errorMessage);

  @Input() model = new TableModel();
  disabled = false;
  @Input() size = 'md';
  @Input() showSelectionColumn = true;
  @Input() enableSingleSelect = true;
  @Input() striped = false;
  @Input() sortable = false;
  @Input() isDataGrid = false;
  @Input() noData = false;
  @Input() stickyHeader = false;
  @Input() skeleton = false;
  @Input() ariaLabelledby = 'table';
  @Input() ariaDescribedby = 'desc';
  @Input() invalid = true;
  @Input() placeholder = 'Content';
  @Input() invalidText = '';
  @Input() dropUp = false;
  @Input() warn = false;
  @Input() theme = 'dark';
  @Input() warnText = 'This is a warning';

  @Input() modelPagination = new PaginationModel();
  @Input() disabledPagination = false;
  @Input() pageInputDisabled = false;

  @Input() isActive = true;
  @Input() @HostBinding("class.cds--loading-overlay") overlay = false;

  @ViewChild('overflowMenuItemTemplate', {static: false})
  protected overflowMenuItemTemplate: TemplateRef<any> | undefined;
  @ViewChild('overflowMenuItemTemplateRemove', {static: false})
  protected overflowMenuItemTemplateRemove: TemplateRef<any> | undefined;
  @ViewChild('overflowMenuItemTemplateEdit', {static: false})
  protected overflowMenuItemTemplateEdit: TemplateRef<any> | undefined;

  dataSet = [];

  filterNodeNames(searchString: string) {
    this.model.data = this.dataSet
      .filter((row: TableItem[]) => row[1].data.toLowerCase().includes(searchString.toLowerCase()));
  }

  selectPage(page: number) {
    this.modelPagination.currentPage = page;
    this.store.dispatch(
      RoleActions.getAllRole({
        token: this.token,
        page: page,
        size: this.numberSize,
      }),
    );
  }

  isActiveOpenCUD: boolean = false;
  currentOpenRole = 1;

  openCUD(role: number) {
    this.currentOpenRole = role;
    this.isActiveOpenCUD = true;

    if (role == 3) {
      let dataUpdate = {
        id: this.selectedId,
        name: this.nameRole,
        description: this.descriptionRole,
      };
      if (this.selectedId !== '') {
        this.isActiveOpenCUD = true;
      } else {
        this.isActiveOpenCUD = false;
      }
      this.editForm.patchValue(dataUpdate);
    }
  }

  closeCUD() {
    this.isActiveOpenCUD = false;
  }

  selectedId: string = '';
  selectedRowData: string = '';
  selectedRowName: string = '';
  selectedRowDescription: string = '';
  nameRole = '';
  descriptionRole = '';

  onRowSelected(event: any) {
    if (event.selectedRowIndex !== undefined && event.selectedRowIndex >= 0) {
      this.selectedRowData = this.dataSet[event.selectedRowIndex][0].data;
      this.selectedRowName = this.dataSet[event.selectedRowIndex][1].data;
      this.selectedRowDescription = this.dataSet[event.selectedRowIndex][2].data;
      this.selectedId = this.selectedRowData;
      this.nameRole = this.selectedRowName;
      this.descriptionRole = this.selectedRowDescription;
    } else {
      this.selectedRowData = '';
      console.log('No row selected');
    }
  }

  addForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl(''),
  });

  onSubmitAdd() {
    let addItem: RoleModel = {
      id: this.addForm.value.id,
      name: this.addForm.value.name,
      description: this.addForm.value.description,
    };
    this.dataSet = [
      ...this.dataSet,
      [
        new TableItem({data: addItem.id}),
        new TableItem({data: addItem.name}),
        new TableItem({data: addItem.description}),
      ],
    ];
    this.store.dispatch(
      RoleActions.createRole({
        token: this.token,
        role: addItem,
      }),
    );
    this.addForm.reset();
    this.model.data = this.dataSet;
    this.isActiveOpenCUD = false;
  }

  editForm = new FormGroup({
    id: new FormControl({value: '', disabled: true}),
    name: new FormControl(''),
    description: new FormControl(''),
  });

  editFormRole() {
    let form: TableItem[] = [
      new TableItem({data: this.selectedId}),
      new TableItem({data: this.editForm.value.name}),
      new TableItem({data: this.editForm.value.description}),
    ];
    let rowIndex = this.dataSet.findIndex(
      (row: TableItem[]) => row[0].data === this.selectedId
    );
    if (rowIndex !== -1) {
      this.dataSet[rowIndex] = form;
      this.store.dispatch(
        RoleActions.updateRole({
          token: this.token,
          id: this.selectedId,
          role: {
            id: this.selectedId,
            name: this.editForm.value.name,
            description: this.editForm.value.description,
          }
        }),
      );
    }
    this.model.data = this.dataSet;
    this.selectedId = '';
    this.editForm.reset();
    this.isActiveOpenCUD = false;
  }

  deleteData() {
    if (this.selectedId !== undefined) {
      let rowIndex = this.dataSet.findIndex((row: TableItem[]) => row[0].data === this.selectedId);
      if (rowIndex !== -1) {
        this.dataSet = this.dataSet.filter((row: TableItem[]) => row[0].data !== this.selectedId);
        this.store.dispatch(
          RoleActions.deleteRole({
            token: this.token,
            id: this.selectedId,
          }),
        );
        this.model.data = this.dataSet;
        this.selectedId = '';
      } else {
        console.log('No data');
      }
    }
  }
}
