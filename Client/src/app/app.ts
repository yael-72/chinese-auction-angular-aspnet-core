import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GiftManage } from './Components/Feature/Gift/gift-manage/gift-manage';
import { GiftList } from './Components/Feature/Gift/gift-list/gift-list';
import { Login } from './Components/Feature/Auth/login/login';
import { Navigation } from './Components/navigation/navigation';
import { FooterComponent } from './Components/footer/footer';
import { SystemMessageComponent } from './Components/shared/system-message/system-message.component';

@Component({
  selector: 'app-root',
  imports: [Navigation, FooterComponent, SystemMessageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('FinalProject');
}
