import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
  path: 'admin',
  loadChildren: () =>
    import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
}

];
