import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedModule} from './shared/shared.module';
import {NavbarComponent} from './components/navbar/navbar.component';
import {Auth, onAuthStateChanged} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuthState} from './ngrx/auth/auth.state';
import * as AuthActions from './ngrx/auth/auth.actions';
import {LoadingComponent} from './pages/loading/loading.component';
import {Subscription, combineLatest} from 'rxjs';
import {NotificationService} from 'carbon-components-angular';
import * as ProfileAction from './ngrx/profile/profile.actions';
import {ProfileState} from './ngrx/profile/profile.state';
import {ToastrService} from 'ngx-toastr';
import {ProfileModel} from './models/profile.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, NavbarComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [NotificationService],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Imago Admin';
  subscriptions: Subscription[] = [];
  idToken$ = this.store.select('auth', 'idToken');
  uid$ = this.store.select('auth', 'uid');

  constructor(
    private toastr: ToastrService,
    private auth: Auth,
    private router: Router,
    private store: Store<{
      auth: AuthState;
      profile: ProfileState;
    }>
  ) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        let idToken = await user!.getIdToken(true);
        this.store.dispatch(AuthActions.storedIdToken({idToken}));
        this.store.dispatch(AuthActions.storedUserUid({uid: user.uid}));
        console.log(idToken);
        // console.log(idToken);
        // this.router.navigateByUrl('/loading');
      } else {

        // console.log('User is signed out');
        this.router.navigateByUrl('/login');
      }
    });
  }

  protected open = false;

  profile: ProfileModel;

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest({
        idToken: this.idToken$,
        uid: this.uid$,
      }).subscribe(async (res) => {
        if (res.idToken && res.uid) {
          this.store.dispatch(
            AuthActions.getAuthById({
              token: res.idToken,
              id: res.uid,
            })
          );
        }
      }),

      this.store.select('auth', 'idToken').subscribe((val) => {
        if (val != undefined) {
          this.store.dispatch(
            ProfileAction.getMineProfile({
              idToken: val,
            })
          );
        }
      }),

      this.store.select('profile', 'profile').subscribe((val) => {
        this.profile = val;
      }),
      this.store.select('auth', 'authDetail').subscribe((val) => {
        if (val.role == 'admin') {
          if (this.profile.id !== undefined && this.profile.id !== null) {
            console.log(this.profile.id);
            this.router.navigate(['/dashboard']);
            this.toastr.success('Welcome to Imago Admin', '', {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
              progressAnimation: 'increasing',
            });
          } else {
            this.toastr.error(
              ' You have no profile. Go to the Imago app to create a profile',
              'Profile Not Found',
              {
                timeOut: 5000,
                positionClass: 'toast-top-right',
                progressBar: true,
                progressAnimation: 'increasing',
              });
            this.store.dispatch(AuthActions.clearAuth());
            this.store.dispatch(AuthActions.logout());
            this.router.navigate(['/login']);
          }
        }
        if (val.role == 'user') {
          console.log(val.role);
          this.toastr.error(
            'You are not authorized to access this page.' + ' You have no profile. Go to the Imago app to create a profile ' + ' Plase contact the administrator to change Role.',
            'Unauthorized Access',
            {
              timeOut: 5000,
              positionClass: 'toast-top-right',
              progressBar: true,
              progressAnimation: 'increasing',
            },
          );
          this.store.dispatch(AuthActions.clearAuth());
          this.store.dispatch(AuthActions.logout());
          this.router.navigate(['/login']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((val) => {
      val.unsubscribe();
    });
  }
}
