import {Component, HostBinding, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SharedModule} from "../../../../../../shared/shared.module";
import {IconService, PaginationModel, TableHeaderItem, TableItem, TableModel} from "carbon-components-angular";
import Filter20 from '@carbon/icons/es/filter/20';
import * as AuthActions from "../../../../../../ngrx/auth/auth.actions";
import * as ProfileActions from "../../../../../../ngrx/profile/profile.actions";
import {Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import {AuthState} from "../../../../../../ngrx/auth/auth.state";
import {ProfileState} from "../../../../../../ngrx/profile/profile.state";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedModule, AsyncPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
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
            ProfileActions.getAllAuthProfile({
              token: this.token,
              page: this.page,
              size: this.numberSize,
            }),
          );
        }
      }),
    );

    this.authProfile$.subscribe((data) => {
      this.dataset = data.data.map((item) => {
          return [
            new TableItem({data: item.id}),
            new TableItem({data: item.photoUrl, template: this.overflowMenuItemTemplateImg}),
            new TableItem({data: item.profile.userName}),
            new TableItem({data: item.email}),
            new TableItem({data: item.profile.bio}),
            new TableItem({data: item.numberPost}),
            new TableItem({data: item.role}),
            new TableItem({data: item.profile.followers.length}),
            new TableItem({data: item.profile.following.length}),
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
      new TableHeaderItem({data: "Avatar"}),
      new TableHeaderItem({data: "UserName"}),
      new TableHeaderItem({data: "Email"}),
      new TableHeaderItem({data: "Bio"}),
      new TableHeaderItem({data: "NumberPost"}),
      new TableHeaderItem({data: "Role"}),
      new TableHeaderItem({data: "Followers"}),
      new TableHeaderItem({data: "Following"}),
      new TableHeaderItem({data: "Status"}),
      new TableHeaderItem({data: "Choose"}),
    ];
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  subscription: Subscription[] = [];
  authProfile$ = this.store.select((state) => state.profile.authProfile);
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

  @ViewChild("overflowMenuItemTemplateImg", {static: false})
  protected overflowMenuItemTemplateImg: TemplateRef<any> | undefined;
  @ViewChild("overflowMenuItemTemplateChoose", {static: false})
  protected overflowMenuItemTemplateChoose: TemplateRef<any> | undefined;

  selectedId: string = '';

  onRowSelected(index: number) {
    if (index == -1) {
      this.selectedId = '';
      this.photoUrl = '';
      this.role = '';
      this.block = false;
    } else {
      this.selectedId = this.model.data[index][0].data;
      this.photoUrl = this.model.data[index][1].data;
      this.role = this.model.data[index][6].data;
      this.block = this.model.data[index][9].data == "Block" ? false : true;
    }
  }

  errorUrl(src: any) {
    src.target.src = 'https://i.pinimg.com/564x/1a/74/04/1a7404e4d590f8dd0a32563b9217697a.jpg';
  }

  filterNodeNames(searchString: string) {
    this.model.data = this.dataset
      .filter((row: TableItem[]) => row[1].data.toLowerCase().includes(searchString.toLowerCase()));
  }

  selectPage(page: number) {
    this.modelPagination.currentPage = page;
    this.store.dispatch(
      ProfileActions.getAllAuthProfile({
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
    } else {
      this.role = "user";
      this.changeNameRole();
    }
  }

  changeNameRole() {
    this.store.select('auth', 'idToken').subscribe((token) => {
      if (token != '') {
        this.store.dispatch(
          AuthActions.changeRole({
            idToken: token,
            id: this.selectedId,
            role: this.role,
          }),
        );
      }
    });
  }

  changeStatusBlock(name: string) {
    if (name == "block") {
      this.block = true;
      this.changeBlock();
    } else {
      this.block = false;
      this.changeUnBlock();
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
