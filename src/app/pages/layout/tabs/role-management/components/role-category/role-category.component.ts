import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {
  ButtonModule, IconModule,
  IconService, InputModule, LoadingModule,
  PaginationModel,
  PaginationModule,
  TableHeaderItem,
  TableItem,
  TableModel,
  TableModule
} from "carbon-components-angular";
import {Subscription} from "rxjs";
import * as RoleActions from "../../../../../../ngrx/role/role.actions";
import {Store} from "@ngrx/store";
import {RoleState} from "../../../../../../ngrx/role/role.state";
import {AuthState} from "../../../../../../ngrx/auth/auth.state";
import {AsyncPipe} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-role-category',
  standalone: true,
  imports: [
    PaginationModule,
    TableModule,
    AsyncPipe,
    ButtonModule,
    IconModule,
    InputModule,
    LoadingModule,
    ReactiveFormsModule
  ],
  templateUrl: './role-category.component.html',
  styleUrl: './role-category.component.scss'
})
export class RoleCategoryComponent implements OnInit {
  constructor(
    protected iconService: IconService,
    private store: Store<{ role: RoleState; auth: AuthState }>,
  ) {
    this.iconService.registerAll([]);
  }

  ngOnInit(): void {
    this.subscription.push(
      this.store.select('auth', 'idToken').subscribe((token) => {
        if (token != '') {
          this.token = token;
          this.store.dispatch(
            RoleActions.getListAdminRole({
              token: token,
              page: this.page,
              size: this.numberSize,
            }),
          );
        }
      }),
    );
    this.adminRoles$.subscribe((data) => {
      this.dataSetUserListRole = data.data.map((item) => {
        return [
          new TableItem({data: item.id}),
          new TableItem({data: item.profile.userName}),
        ];
      });
      this.modelUserListRole.data = this.dataSetUserListRole;
      this.modelPagination.totalDataLength = data.endPage;
    });

    this.modelUserListRole.header = [
      new TableHeaderItem({data: "Id"}),
      new TableHeaderItem({data: "UserName"}),
    ];

    this.modelPagination.currentPage = 1;
  }

  subscription: Subscription[] = [];
  page = 1;
  token = '';
  numberSize = 10;
  dataSetUserListRole = [];
  adminRoles$ = this.store.select((state) => state.role.adminRoleList);
  loadingAdminRole$ = this.store.select((state) => state.role.isLoading);
  errorAdminRole$ = this.store.select((state) => state.role.errorMessage);

  @Input() modelUserListRole = new TableModel();
  @Input() striped = false;
  @Input() sortable = false;
  @Input() isDataGrid = false;
  @Input() stickyHeader = false;
  @Input() skeleton = false;
  disabled = false;
  @Input() modelPagination = new PaginationModel();
  @Input() disabledPagination = false;
  @Input() pageInputDisabled = false;

  @Input() isActive = true;
  @Input() @HostBinding("class.cds--loading-overlay") overlay = false;

  selectPage(page: number) {
    this.modelPagination.currentPage = page;
    this.store.dispatch(
      RoleActions.getListAdminRole({
        token: this.token,
        page: page,
        size: this.numberSize,
      }),
    );
  }
}
