import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { DashboardDetailComponent } from './components/dashboard-detail/dashboard-detail.component';
import {SettingsComponent} from "../settings/settings.component";

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardOverviewComponent,
      },
      // {
      //   path: ':name',
      //   component: DashboardDetailComponent,
      // },
      {
        path: 'detail',
        loadChildren: () =>
          import('./components/dashboard-detail/dashboard-detail.routes').then(
            (mod) => mod.DASHBOARD_DETAIL_ROUTES,
          ),
      },
    ],
  },
];
