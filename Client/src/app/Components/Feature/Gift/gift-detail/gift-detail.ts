import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { Gift } from '../../../../model/gift.model';
import { GiftCrud } from '../../../../services/gift-crud';
import { TicketService } from '../../../../services/ticket-service';
import { Authservice } from '../../../../services/authservice';
import { User } from '../../../../model/user.model';
import { Ticket } from '../../../../model/ticket.model';
import { LotteryService } from '../../../../services/lottery-service';
import { GiftSpinnerComponent } from '../gift-spinner/gift-spinner';

@Component({
  selector: 'app-gift-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    DrawerModule,
    GiftSpinnerComponent
  ],
  providers: [MessageService],
  templateUrl: './gift-detail.html',
  styleUrl: './gift-detail.scss'
})
export class GiftDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private giftService = inject(GiftCrud);
  private ticketService = inject(TicketService);
  private authSrv = inject(Authservice);
  private messageService = inject(MessageService);
  private lotterySrv = inject(LotteryService);

  gift: Gift | null = null;
  loggedIn: boolean = false;
  user: User | null = null;
  loading: boolean = true;
  buyersVisible: boolean = false;
  winnersVisible: boolean = false;
  buyers: Array<{buyer: any, count: number}> = [];
  winners: Array<{buyer: any, count: number}> = [];
  loadingLottery: boolean = false;
  totalPurchases: number = 0;

  get isAdmin(): boolean {
    return this.user?.role === 'Admin';
  }

  get purchaseLabel(): string {
    if (this.totalPurchases === 0) {
      return '0 רכישות';
    } else if (this.totalPurchases === 1) {
      return '1 רכישה';
    } else {
      return `${this.totalPurchases} רכישות`;
    }
  }

  ngOnInit(): void {
    this.authSrv.user.subscribe(u => {
      this.loggedIn = !!u;
      this.user = u;
    });

    const giftId = this.route.snapshot.paramMap.get('id');
    if (giftId) {
      this.loadGiftDetail(parseInt(giftId));
    } else {
      this.router.navigate(['/gift']);
    }
  }

  loadGiftDetail(id: number): void {
    this.giftService.getById(id).subscribe({
      next: (gift: Gift) => {
        this.gift = gift;
        this.loadBuyers(id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading gift:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load gift details',
          life: 3000
        });
        this.loading = false;
        this.router.navigate(['/gift']);
      }
    });
  }

  loadBuyers(giftId: number): void {
    this.ticketService.getPaid(giftId).subscribe({
      next: (tickets: Ticket[]) => {
        if (!tickets || tickets.length === 0) {
          this.buyers = [];
          this.totalPurchases = 0;
          return;
        }

        // Count total purchases
        this.totalPurchases = tickets.length;

        const grouped = new Map<string, {buyer: User, count: number}>();
        tickets.forEach(ticket => {
          if (ticket?.buyer) {
            const key = ticket.buyer.userName || ticket.buyer.id.toString();
            if (grouped.has(key)) {
              grouped.get(key)!.count++;
            } else {
              grouped.set(key, { buyer: ticket.buyer, count: 1 });
            }
          }
        });
        this.buyers = Array.from(grouped.values());
        console.log('Loaded buyers:', this.buyers, 'Total purchases:', this.totalPurchases);
      },
      error: (err: any) => {
        console.error('Error loading buyers:', err);
        this.buyers = [];
        this.totalPurchases = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load buyers: ' + (err?.error?.message || err?.message || 'Unknown error'),
          life: 3000
        });
      }
    });
  }

  addToBasket(): void {
    if (!this.loggedIn || !this.gift || !this.user) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please login first',
        life: 3000
      });
      return;
    }

    const ticket = { buyerId: this.user.id, giftId: this.gift.id };
    this.ticketService.add(ticket as any).subscribe({
      next: (res: any) => {
        const detail = res?.message ?? `${this.gift?.name} added to basket`;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail,
          life: 3000
        });
        // Reload total purchases count
        this.loadBuyers(this.gift!.id);
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Could not add to basket';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 3000
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/gift']);
  }

  runLottery(): void {
    if (!this.gift?.id) return;
    
    this.loadingLottery = true;
    this.lotterySrv.RunDraw(this.gift.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lottery completed',
          life: 3000
        });
        // Reload gift details
        this.loadGiftDetail(this.gift!.id);
        this.loadingLottery = false;
      },
      error: (err) => {
        const detail = typeof err?.error === 'string' ? err.error : (err?.error?.message ?? 'Could not run lottery');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 3000
        });
        this.loadingLottery = false;
      }
    });
  }

  showBuyers(): void {
    this.buyersVisible = true;
  }

  showWinners(): void {
    if (!this.gift?.id) return;

    this.ticketService.getPaid(this.gift.id).subscribe({
      next: (tickets: Ticket[]) => {
        if (!tickets || tickets.length === 0) {
          this.winners = [];
          this.winnersVisible = true;
          return;
        }

        const grouped = new Map<string, {buyer: User, count: number}>();
        tickets.forEach(ticket => {
          if (ticket?.buyer) {
            const key = ticket.buyer.userName || ticket.buyer.id.toString();
            if (grouped.has(key)) {
              grouped.get(key)!.count++;
            } else {
              grouped.set(key, { buyer: ticket.buyer, count: 1 });
            }
          }
        });
        this.winners = Array.from(grouped.values());
        this.winnersVisible = true;
        console.log('Loaded winners:', this.winners);
      },
      error: (err) => {
        console.error('Error loading winners:', err);
        this.winners = [];
        this.winnersVisible = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load winners: ' + (err?.error?.message || err?.message || 'Unknown error'),
          life: 3000
        });
      }
    });
  }
}
