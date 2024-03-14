import {AfterViewInit, Component, Input, OnChanges, OnInit} from '@angular/core';
import {SharedModule} from '../../../../shared/shared.module';
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit, OnChanges, AfterViewInit {
  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.name = this.router.url.split('/').pop();
    this.index = this.types.findIndex((item) => item.route === this.name);
    this.navigateTo(this.name, this.index);
  }

  ngOnChanges(): void {
  }

  ngAfterViewInit() {
  }

  name = '';
  index = 0;
  tabIndex = 0;

  types = [
    {
      name: 'Auth',
      route: 'auth',
    },
    {
      name: 'Profile',
      route: 'profile',
    },
  ];

  @Input() skeleton = false;
  @Input() followFocus = true;
  @Input() cacheActive = false;
  @Input() isNavigation = true;
  @Input() type = 'line';

  navigateTo(route: string, tabIndex: number) {
    this.tabIndex = tabIndex;
    this.router.navigate(['dashboard/user/', route]).then();
  }
}
