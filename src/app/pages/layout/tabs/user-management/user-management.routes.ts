import {Route} from "@angular/router";
import {UserManagementComponent} from "./user-management.component";
import {AuthnoprofileComponent} from "./components/authnoprofile/authnoprofile.component";
import {ProfileComponent} from "./components/profile/profile.component";

export const USER_MANAGEMENT: Route[] = [
  {
    path: '',
    component: UserManagementComponent,
    children: [
      {
        path: 'auth',
        component: AuthnoprofileComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full',
      },
    ],
  },
];
