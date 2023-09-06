import { inject, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DataService, SharedModule } from '@vendure/admin-ui/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { VerifySellerComponent } from './components/seller-enable-disable/verify-seller.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: VerifySellerComponent,
        data: { breadcrumb: 'Verify Seller' },
      },
    ]),
  ],
  declarations: [VerifySellerComponent],
})
export class VerifySellerUIModule {}
