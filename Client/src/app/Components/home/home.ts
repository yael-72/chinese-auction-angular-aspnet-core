import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  private timerInterval: any;
  private endTime: number = 0;
  scrollPosition = 0;

  @HostListener('window:scroll')
  onScroll() {
    this.scrollPosition = window.pageYOffset;
  }

  features = [
    {
      icon: '🎁',
      title: 'מתנות מובחרות',
      description: 'קולקציה של מתנות פרימיום באיכות גבוהה'
    },
    {
      icon: '💎',
      title: 'מחירים יוצאי דופן',
      description: 'הנחות עד 70% על מוצרים בחירה'
    },
    {
      icon: '🚀',
      title: 'משלוח מהיר',
      description: 'משלוח לכל המדינה תוך 2-3 ימי עבודה'
    },
    {
      icon: '🔒',
      title: 'קנייה בטוחה',
      description: 'תשלום מאובטח וגדר לקונה'
    },
    {
      icon: '✨',
      title: 'חוויה יוצאת דופן',
      description: 'עיצוב מודרני וממשק ידידותי למשתמש'
    },
    {
      icon: '🎊',
      title: 'הפתעות בונוס',
      description: 'מתנות מיוחדות וקופונים להנחה'
    }
  ];

  ngOnInit() {
    // Check if endTime is already stored in localStorage
    const storedEndTime = localStorage.getItem('saleEndTime');
    
    if (storedEndTime) {
      // Use existing sale end time
      this.endTime = parseInt(storedEndTime, 10);
    } else {
      // First time - set end date to 20 days from now
      const saleEnd = new Date();
      saleEnd.setDate(saleEnd.getDate() + 20);
      this.endTime = saleEnd.getTime();
      // Store it for future page loads
      localStorage.setItem('saleEndTime', this.endTime.toString());
    }
    
    // Initial calculation
    this.updateCountdown();
    
    // Update every second
    this.timerInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  updateCountdown() {
    const now = new Date().getTime();
    const distance = this.endTime - now;

    if (distance > 0) {
      const daysVal = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hoursVal = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesVal = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secondsVal = Math.floor((distance % (1000 * 60)) / 1000);
      
      this.days = this.pad(daysVal);
      this.hours = this.pad(hoursVal);
      this.minutes = this.pad(minutesVal);
      this.seconds = this.pad(secondsVal);
    } else {
      this.days = this.hours = this.minutes = this.seconds = '00';
      clearInterval(this.timerInterval);
    }
  }
}
