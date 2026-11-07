import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gift-spinner.html',
  styleUrls: ['./gift-spinner.scss']
})
export class GiftSpinnerComponent {
  @Input() isLoading: boolean = false;
  @Input() giftName: string = 'מתנה';
}
