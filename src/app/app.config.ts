import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore(),
    provideEffects(),
    provideHttpClient(),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'itss-imago-0000',
          appId: '1:1098187958856:web:931b5d503852e1c9a1867d',
          storageBucket: 'itss-imago-0000.appspot.com',
          apiKey: 'AIzaSyAJ93BuFGs7gOJe9kudLYvAn4-Fp6Q936M',
          authDomain: 'itss-imago-0000.firebaseapp.com',
          messagingSenderId: '1098187958856',
          measurementId: 'G-7TVCQGP8RS',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())),
  ],
};