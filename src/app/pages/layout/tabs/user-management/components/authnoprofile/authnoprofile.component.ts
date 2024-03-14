import {Component, HostBinding, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SharedModule} from "../../../../../../shared/shared.module";
import {AsyncPipe} from "@angular/common";
import * as AuthActions from "../../../../../../ngrx/auth/auth.actions";
import * as ProfileActions from "../../../../../../ngrx/profile/profile.actions";
import {IconService, PaginationModel, TableHeaderItem, TableItem, TableModel} from "carbon-components-angular";
import {Store} from "@ngrx/store";
import {ProfileState} from "../../../../../../ngrx/profile/profile.state";
import {AuthState} from "../../../../../../ngrx/auth/auth.state";
import Filter20 from '@carbon/icons/es/filter/20';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-authnoprofile',
  standalone: true,
  imports: [SharedModule, AsyncPipe],
  templateUrl: './authnoprofile.component.html',
  styleUrl: './authnoprofile.component.scss'
})
export class AuthnoprofileComponent implements OnInit, OnDestroy {
  constructor(protected iconService: IconService
    , private store: Store<{ profile: ProfileState; auth: AuthState }>,
  ) {
    this.iconService.registerAll([Filter20]);
  }

  ngOnInit(): void {
    this.subscription.push(
      this.store.select('auth', 'idToken').subscribe((token) => {
        if (token != '') {
          this.token = token;
          this.store.dispatch(
            ProfileActions.getAllAuthNoProfile({
              token: this.token,
              page: this.page,
              size: this.numberSize,
            }),
          );
        }
      }),
    );

    this.authNoProfile$.subscribe((data) => {
      this.dataset = data.data.map((item) => {
          const date = new Date(
            item.createdAt._seconds * 1000 +
            item.createdAt._nanoseconds / 1000000
          );
          const formattedDate = date.toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',

            hour12: false,
          });
          return [
            new TableItem({data: item.id}),
            new TableItem({data: item.email}),
            new TableItem({data: item.role}),
            new TableItem({data: formattedDate}),
            new TableItem({data: item.isBanned ? "Unblock" : "Block"}),
            new TableItem({data: "Choose", template: this.overflowMenuItemTemplateChoose}),
          ]
        }
      );
      this.model.data = this.dataset;
      this.modelPagination.totalDataLength = data.endPage;
    });

    this.model.header = [
      new TableHeaderItem({data: 'Id'}),
      new TableHeaderItem({data: "Email"}),
      new TableHeaderItem({data: "Role"}),
      new TableHeaderItem({data: "Created At"}),
      new TableHeaderItem({data: "Status"}),
      new TableHeaderItem({data: "Choose"}),
    ];
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  subscription: Subscription[] = [];
  authNoProfile$ = this.store.select((state) => state.profile.authNoProfile);
  loading$ = this.store.select((state) => state.profile.isLoading);
  error$ = this.store.select((state) => state.profile.errorMess);
  dataset = [];
  token = "";
  photoUrl = "";
  role = "";
  block = false;
  page = 1;
  numberSize = 10;

  @Input() model = new TableModel();
  @Input() modelPagination = new PaginationModel();
  @Input() disabledPagination = false;
  @Input() pageInputDisabled = false;
  disabled = false;
  @Input() size = "md";
  @Input() showSelectionColumn = false;
  @Input() enableSingleSelect = false;
  @Input() striped = false;
  @Input() sortable = false;
  @Input() isDataGrid = false;
  @Input() noData = false;
  @Input() stickyHeader = false;
  @Input() skeleton = false;
  @Input() ariaLabelledby = "table";
  @Input() ariaDescribedby = "desc";

  @Input() isActive = true;
  @Input() @HostBinding("class.cds--loading-overlay") overlay = false;
  @ViewChild("overflowMenuItemTemplateChoose", {static: false})
  protected overflowMenuItemTemplateChoose: TemplateRef<any> | undefined;

  selectedId: string = '';

  onRowSelected(index: number) {
    if (index == -1) {
      this.selectedId = '';
      this.role = '';
      this.block = false;
    } else {
      this.selectedId = this.model.data[index][0].data;
      this.role = this.model.data[index][2].data;
      this.block = this.model.data[index][4].data == "Block" ? false : true;
    }
  }

  filterNodeNames(searchString: string) {
    this.model.data = this.dataset
      .filter((row: TableItem[]) => row[1].data.toLowerCase().includes(searchString.toLowerCase()));
  }

  selectPage(page: number) {
    this.modelPagination.currentPage = page;
    this.store.dispatch(
      ProfileActions.getAllAuthNoProfile({
        token: this.token,
        page: page,
        size: this.numberSize,
      }),
    );
  }

  overflowOnClick = (event: any) => {
    event.stopPropagation();
  }

  changeRole(name: string) {
    if (name == "admin") {
      this.role = "admin";
      this.changeNameRole();
      this.model.data = this.dataset;
    } else {
      this.role = "user";
      this.changeNameRole();
      this.model.data = this.dataset;
    }
  }

  changeNameRole() {
    this.store.dispatch(
      AuthActions.changeRole({
        idToken: this.token,
        id: this.selectedId,
        role: this.role,
      }),
    );
  }


  changeStatusBlock(name: string) {
    if (name == "block") {
      this.block = true;
      this.changeBlock();
      this.model.data = this.dataset;
    } else {
      this.block = false;
      this.changeUnBlock();
      this.model.data = this.dataset;
    }
  }

  changeBlock() {
    this.store.dispatch(
      AuthActions.changeBlock({
        idToken: this.token,
        id: this.selectedId,
        isBanned: this.block,
      }),
    );
  }

  changeUnBlock() {
    this.store.dispatch(
      AuthActions.changeUnblock({
        idToken: this.token,
        id: this.selectedId,
        isBanned: this.block,
      }),
    );
  }
}
