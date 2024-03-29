import { CanActivateViaAuthGuard } from '../auth/guards/auth.guard';
import { UserDetailsComponent } from '../admin/user-list/user-details/user-details.component';
import { UserEditComponent } from '../admin/user-list/user-edit/user-edit.component';

export const UserRoutes = [
  {
    path: '',
    canActivate: [ CanActivateViaAuthGuard ],
    children: [
      {
        path: 'profile',
        children: [
          {
            path: '',
            component: UserDetailsComponent
          },
          {
            path: 'edit',
            component: UserEditComponent
          }
        ]
      },
    ]
  },
];
