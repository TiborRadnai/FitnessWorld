import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { ADMIN_ROUTES } from './admin/admin.routes';
import { Home } from './home/home';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      // ide jön a shop, contact, stb.
    ]
  },

  {
    path: 'admin',
    canActivate: [AdminGuard],
    component: AdminLayout,
    children: ADMIN_ROUTES
  }
];

console.log("🔥 APP ROUTES BETÖLTVE:", routes);