import { Routes } from '@angular/router';
import { Home } from './Components/home/home';
import { Login } from './Components/Feature/Auth/login/login';
import { Register } from './Components/Feature/Auth/register/register';
import { Gift } from './model/gift.model';
import { GiftManage } from './Components/Feature/Gift/gift-manage/gift-manage';
import { GiftList } from './Components/Feature/Gift/gift-list/gift-list';
import { GiftDetailComponent } from './Components/Feature/Gift/gift-detail/gift-detail';
import { Donor } from './model/donor.model';
import { DonorManage } from './Components/Feature/Donor/donor-manage/donor-manage';
import { Basket } from './Components/Feature/Ticket/basket/basket';
import { Payment } from './Components/Feature/Ticket/payment/payment';

export const routes: Routes = [
    {path:"", component:Home},
    {path:"login", component:Login},
    {path:"register", component:Register},
    {path:"donor", component:DonorManage},
    {path:"gift", component:GiftList},
    {path:"gift/:id", component:GiftDetailComponent},
    {path:"gift-manage", component:GiftManage},
    {path:"basket", component:Basket},
    {path:"payment", component:Payment}
];
