import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { GiftCrud } from '../../../../services/gift-crud';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../../../model/gift.model';
import { Authservice } from '../../../../services/authservice';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../model/user.model';
import { DrawerModule } from 'primeng/drawer';
import { TicketService } from '../../../../services/ticket-service';
import { Ticket } from '../../../../model/ticket.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { LotteryService } from '../../../../services/lottery-service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GiftSpinnerComponent } from '../gift-spinner/gift-spinner';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-gift-list',
  standalone: true,
  imports: [InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, InputNumberModule,
    CommonModule,
    DataViewModule,
    TagModule,
    RatingModule,
    ButtonModule,
    SelectButtonModule,
    FormsModule,
    DrawerModule,
    ToastModule,
    GiftSpinnerComponent
  ],
  providers: [MessageService],
  templateUrl: './gift-list.html',
  styleUrls: ['./gift-list.scss'],
})
export class GiftList {
  lotterySrv: LotteryService = inject(LotteryService);
  crudSrv: GiftCrud = inject(GiftCrud);
  authSrv: Authservice = inject(Authservice)
  ticketSrv: TicketService = inject(TicketService)
  http: HttpClient = inject(HttpClient)
  msgSrv = inject(MessageService)
  route = inject(ActivatedRoute)
  router = inject(Router)
  cdr = inject(ChangeDetectorRef)
  list$ = this.crudSrv.getAll();

  loggedIn: boolean = false
  user: User | null = null

  tickets: Ticket[] = []
  groupedBuyers: Array<{buyer: any, count: number}> = []
  winners: Ticket[] = []
  groupedWinners: Array<{buyer: any, count: number}> = []
  item: Gift | null = null
  winnerNames: Map<number, string> = new Map();
  buyerCountCache: Map<number, number> = new Map();

  layout: 'list' | 'grid' = 'grid';
  options = ['list', 'grid'];
  visible: boolean = false
  visibleWinners: boolean = false
  sortBy: string | null = null;
  loadingGiftIds: Set<number> = new Set();
 
  sortOptions = [
    { label: 'מחיר ⬇️', value: 'price' },
    { label: 'מחיר ⬆️', value: 'price_desc' },
    { label: 'קטגוריה ⬇️', value: 'category' },
    { label: 'קטגוריה ⬆️', value: 'category_desc' },
    { label: 'מספר קונים ⬇️', value: 'buyers' },
    { label: 'מספר קונים ⬆️', value: 'buyers_desc' }
  
  ];

  donorName: string | null = this.route.snapshot.queryParamMap.get('donorName')

   
 
  ngOnInit() {
    this.authSrv.user.subscribe(u => {
      this.loggedIn = !!u
      this.user = u
      console.log("user:" + this.user);
    })
    this.refresh();
  }

  // deduplicateGifts(gifts: Gift[]): Gift[] {
  //   const seenNames = new Set<string>();
  //   const seenIds = new Set<number>();
  //   return gifts.filter(gift => {
  //     // Remove duplicates by ID first
  //     if (seenIds.has(gift.id)) {
  //       return false;
  //     }
  //     seenIds.add(gift.id);
      
  //     // Remove duplicates by name
  //     if (seenNames.has(gift.name)) {
  //       return false;
  //     }
  //     seenNames.add(gift.name);
  //     return true;
  //   });
  // }

  filter() {
    this.refresh();
    console.log(this.list$);
  }

  showDrawer(item: Gift) {
    this.item = item
    this.ticketSrv.getPaid(item.id).subscribe(data => { 
      this.tickets = data;
      this.groupedBuyers = this.deduplicateBuyers(data);
      console.log(this.groupedBuyers);
    })
    this.visible = true;
  }

  private deduplicateBuyers(tickets: Ticket[]): Array<{buyer: any, count: number}> {
    const buyerMap = new Map<string, {buyer: any, count: number}>();
    
    tickets.forEach(ticket => {
      if (ticket.buyer && ticket.buyer.userName) {
        const key = ticket.buyer.userName;
        if (buyerMap.has(key)) {
          const entry = buyerMap.get(key)!;
          entry.count++;
        } else {
          buyerMap.set(key, { buyer: ticket.buyer, count: 1 });
        }
      }
    });
    
    return Array.from(buyerMap.values());
  }

  showWinners(item: Gift) {
    this.item = item
    this.ticketSrv.getPaid(item.id).subscribe(data => { 
      this.winners = data;
      this.groupedWinners = this.deduplicateBuyers(data);
      console.log(this.groupedWinners);
    })
    this.visibleWinners = true;
  }

  addToBasket(id: number,) {
    let t = { buyerId: this.user?.id, giftId: id }
    this.ticketSrv.add(t).subscribe({
      next: (res: any) => {
        const detail = res?.message ?? 'נוסף לסל';
        this.msgSrv.add({ severity: 'success', detail, life: 1200 });
      },
      error: (err: any) => {
        const detail = err?.error?.message ?? 'לא הצליח להוסיף לסל';
        this.msgSrv.add({ severity: 'error', detail, life: 3000 });
      }
    })
  }

  // getBuyerCount(giftId: number): number {
  //   // Return cached value if available
  //   if (this.buyerCountCache.has(giftId)) {
  //     const cached = this.buyerCountCache.get(giftId);
  //     if (cached !== undefined && cached !== -1) {
  //       console.log(`[getBuyerCount] Returning cached count for gift ${giftId}: ${cached}`);
  //       return cached;
  //     }
  //   }
    
  //   // If not in cache, start loading
  //   if (!this.buyerCountCache.has(giftId)) {
  //     this.buyerCountCache.set(giftId, -1);
  //     console.log(`[getBuyerCount] Starting to load buyer count for gift ${giftId}`);
      
  //     this.ticketSrv.getPaid(giftId).subscribe(data => {
  //       const count = data ? data.length : 0;
  //       console.log(`[getBuyerCount] Received ${count} tickets for gift ${giftId}`);
  //       this.buyerCountCache.set(giftId, count);
  //       this.cdr.detectChanges();
  //     });
  //   }
    
  //   return 0;
  // }
  // applySort() {
  //   this.list$ = this.crudSrv.getAll(this.donorName, this.sortBy).pipe(
  //     map(gifts => this.deduplicateGifts(gifts))
  //   );
  // }


  runAllLotteries() {
    this.crudSrv.getAll(this.donorName, this.sortBy).subscribe(gifts => {

      const pendingGifts = gifts.filter(g => !g.winnerId);
      if (pendingGifts.length === 0) {
        return;
      }
      
      // Add all pending gifts to loading set
      pendingGifts.forEach(g => this.loadingGiftIds.add(g.id));
      
      const requests = pendingGifts.map(g => {
        return this.lotterySrv.RunDraw(g.id).pipe(
          map((res: string) => ({ giftId: g.id, result: res }))
        );
      });

      forkJoin(requests).subscribe({
        next: (results: any[]) => {
          // Wait for backend to update, refresh data, then clear loading indicators
          setTimeout(async () => {
            await this.refresh();
            this.loadingGiftIds.clear();
            this.msgSrv.add({ severity: 'success', detail: 'כל ההגרלות הסתיימו', life: 2000 });
          }, 1000);
        },
        error: (err) => {
          // On error still clear loaders after a short delay so spinner remains visible during error reporting
          setTimeout(() => {
            this.loadingGiftIds.clear();
            console.error("שגיאה בחלק מההגרלות", err);
            this.refresh();
          }, 800);
        }
      });
    });
  }

  // runLottery(giftId: number) {
  //   // בהגרלה בודדת, ה-refresh חייב להיות בתוך ה-subscribe
  //   this.lotterySrv.RunDraw(giftId).subscribe({
  //     next: () => {
  //       this.refresh();
  //       this.msgSrv.add({ severity: 'success', detail: 'הוגרל בהצלחה', life: 1200 });
  //     }
  //   });
  // }


  // runLottery(giftId: number) {
  //   console.log('runLottery -> calling RunDraw for', giftId);
  //   this.loadingGiftIds.add(giftId);
  //   this.lotterySrv.RunDraw(giftId).subscribe({
  //     next: (res: string) => {
  //       console.log('RunDraw success', res);
  //       // Keep spinner visible until after refresh completes so users see the loading state
  //       setTimeout(async () => {
  //         await this.refresh();
  //         this.loadingGiftIds.delete(giftId);
  //       }, 1500);
  //       // res is plain text message from backend
  //       const detail = res && res.length > 0 ? res : 'הוגרל בהצלחה';
  //       this.msgSrv.add({ severity: 'success', summary: 'הצלחה', detail, life: 3000 });
        
  //     },
  //     error: (err) => {
  //       // Keep spinner for a short time so error state is visible, then clear
  //       setTimeout(() => {
  //         this.loadingGiftIds.delete(giftId);
  //       }, 800);
  //       console.error('RunDraw error', err);
  //       // For text responses, check error.error which contains the text
  //       const detail = typeof err?.error === 'string' ? err.error : (err?.error?.message ?? 'ההגרלה נכשלה');
  //       this.msgSrv.add({ severity: 'error', summary: 'שגיאה', detail, life: 3000 });
  //     }
  //   })
  // }
  runLottery(giftId: number) {
  console.log('runLottery -> calling RunDraw for', giftId);
  this.loadingGiftIds.add(giftId);
  
  this.lotterySrv.RunDraw(giftId).subscribe({
    next: (res: string) => {
      console.log('RunDraw success', res);
      
      // חכה ש-refresh יסתיים, אז בדוק אם צריך הודעה
      setTimeout(async () => {
        await this.refresh();
        this.loadingGiftIds.delete(giftId);
        
        // ✅ הודעה רק אחרי ש-refresh הסתיים
        const detail = res && res.length > 0 ? res : 'הוגרל בהצלחה';
        this.msgSrv.add({ severity: 'success', summary: '👑 הצלחה', detail, life: 3000 });
      }, 1500);
    },
    error: (err) => {
      setTimeout(() => {
        this.loadingGiftIds.delete(giftId);
        const detail = typeof err?.error === 'string' ? err.error : (err?.error?.message ?? 'ההגרלה נכשלה');
        this.msgSrv.add({ severity: 'error', summary: '⚠️ שגיאה', detail, life: 3000 });
      }, 800);
    }
  })
}

  async refresh() {
    // Clear caches to ensure fresh data is loaded
    this.winnerNames.clear();
    this.buyerCountCache.clear();
    
    this.list$ = this.crudSrv.getAll(null, this.donorName, null, this.sortBy);
    
    // Immediately preload ALL winner names
    try {
      const gifts = await this.list$.toPromise();
      const winnerGifts = gifts?.filter(g => g.winnerId) || [];
      
      if (winnerGifts.length > 0) {
        // Load all winner names in parallel using forkJoin
        const winnerRequests: { [key: number]: any } = {};
        
        winnerGifts.forEach(gift => {
          winnerRequests[gift.id] = this.ticketSrv.getPaid(gift.id).pipe(
            map(tickets => {
              if (tickets && tickets.length > 0) {
                return tickets[0].buyer.name;
              }
              return '';
            }),
            catchError(() => of(''))
          );
        });
        
        // Wait for all requests to complete
        const results = await forkJoin(winnerRequests).toPromise();
        if (results) {
          Object.entries(results).forEach(([giftId, name]: [string, any]) => {
            this.winnerNames.set(parseInt(giftId), name);
          });
        }
      }
      
      // Re-trigger refresh so template gets fresh data
      this.list$ = this.crudSrv.getAll(null, this.donorName, null, this.sortBy);
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading gifts or winners:', error);
    }
  }

  loadWinnerName(giftId: number) {
    // This method is no longer needed - all winners are preloaded in refresh()
    // Kept for backward compatibility
  }

  getWinnerName(giftId: number, winnerId?: number): string {
    // Return cached winner name synchronously (preloaded in refresh())
    return this.winnerNames.get(giftId) || '';
  }

  private downloadBlob(url: string, filename: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
        this.msgSrv.add({ severity: 'success', detail: 'ההורדה החלה', life: 2500 });
      },
      error: (err: any) => {
        console.error('Download error', err);
        const detail = err?.error?.message ?? 'שגיאה בהורדת הדוח';
        this.msgSrv.add({ severity: 'error', detail, life: 4000 });
      }
    })
  }

  downloadWinnersReport() {
    if (!this.user || this.user.role !== 'Admin') return;
    const url = 'https://localhost:7128/api/Report/gift-winners';
    this.downloadBlob(url, 'gift-winners.xlsx');
  }

  downloadSalesReport() {
    if (!this.user || this.user.role !== 'Admin') return;
    const url = 'https://localhost:7128/api/Report/sales-revenue';
    this.downloadBlob(url, 'sales-revenue.xlsx');
  }

  viewGiftDetail(gift: Gift): void {
    this.router.navigate(['/gift', gift.id]);
  }
}