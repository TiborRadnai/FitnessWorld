import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: Dashboard },
  { path: 'inventory', component: Inventory},
  { path: 'sales-overview',
    loadComponent: () =>
      import('./pages/sales-overview/sales-overview').then(m => m.SalesOverview)
  }

];

