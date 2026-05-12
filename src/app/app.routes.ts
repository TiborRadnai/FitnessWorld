import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { ADMIN_ROUTES } from './admin/admin.routes';
import { Home } from './home/home';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },

      // 🔥 IDE JÖN AZ ORDER SUCCESS OLDAL
      {
        path: 'order-success',
        loadComponent: () =>
          import('./home/webshop/order-success/order-success')
            .then(m => m.OrderSuccess)
      },

      // később ide jön majd: shop, product/:id, cart, checkout, stb.
    ]
  },

  {
    path: 'admin',
    component: AdminLayout,
    children: ADMIN_ROUTES
  }
];


