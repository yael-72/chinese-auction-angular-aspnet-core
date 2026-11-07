import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';

export interface SystemMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SystemMessageService {
  private messagesSubject = new BehaviorSubject<SystemMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private messageCounter = 0;

  addMessage(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 3000) {
    const id = `msg-${this.messageCounter++}`;
    const newMessage: SystemMessage = { id, type, title, message, duration };
    
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, newMessage]);

    if (duration > 0) {
      setTimeout(() => this.removeMessage(id), duration);
    }
  }

  removeMessage(id: string) {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next(currentMessages.filter(msg => msg.id !== id));
  }

  success(title: string, message: string, duration?: number) {
    this.addMessage('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number) {
    this.addMessage('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number) {
    this.addMessage('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number) {
    this.addMessage('info', title, message, duration);
  }
}

@Component({
  selector: 'app-system-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-messages-container">
      <div 
        *ngFor="let message of messages$ | async" 
        [@messageAnimation]="'in'"
        [ngClass]="'message message-' + message.type"
        class="luxury-message"
      >
        <div class="message-header">
          <div class="message-icon-wrapper">
            <i [ngClass]="getIconClass(message.type)" class="message-icon"></i>
          </div>
          <div class="message-title">{{ message.title }}</div>
          <button class="message-close" (click)="closeMessage(message.id)">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="message-content">
          {{ message.message }}
        </div>
        <div class="message-progress-bar"></div>
      </div>
    </div>
  `,
  styles: [`
    .system-messages-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .luxury-message {
      pointer-events: auto;
      position: relative;
      min-width: 350px;
      max-width: 450px;
      border-radius: 12px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @media (max-width: 480px) {
      .luxury-message {
        min-width: 280px;
        max-width: 90vw;
      }
      
      .system-messages-container {
        right: 10px;
        left: 10px;
      }
    }

    /* Success Message */
    .message-success {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95));
      border: 2px solid rgba(129, 199, 132, 0.5);
      border-left: 5px solid #4CAF50;
    }

    .message-success .message-icon {
      color: #81C784;
      text-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
    }

    .message-success .message-progress-bar {
      background: linear-gradient(90deg, #4CAF50, #81C784);
    }

    /* Error Message */
    .message-error {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.95), rgba(211, 47, 47, 0.95));
      border: 2px solid rgba(239, 154, 154, 0.5);
      border-left: 5px solid #F44336;
    }

    .message-error .message-icon {
      color: #EF9A9A;
      text-shadow: 0 0 10px rgba(244, 67, 54, 0.6);
    }

    .message-error .message-progress-bar {
      background: linear-gradient(90deg, #F44336, #EF9A9A);
    }

    /* Warning Message */
    .message-warning {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.95), rgba(245, 127, 23, 0.95));
      border: 2px solid rgba(255, 213, 79, 0.5);
      border-left: 5px solid #FFC107;
    }

    .message-warning .message-icon {
      color: #FFD54F;
      text-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
    }

    .message-warning .message-progress-bar {
      background: linear-gradient(90deg, #FFC107, #FFD54F);
    }

    /* Info Message */
    .message-info {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.95), rgba(13, 71, 161, 0.95));
      border: 2px solid rgba(100, 181, 246, 0.5);
      border-left: 5px solid #2196F3;
    }

    .message-info .message-icon {
      color: #64B5F6;
      text-shadow: 0 0 10px rgba(33, 150, 243, 0.6);
    }

    .message-info .message-progress-bar {
      background: linear-gradient(90deg, #2196F3, #64B5F6);
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .message-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .message-icon {
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .message-title {
      flex: 1;
      font-weight: 700;
      font-size: 15px;
      color: #FFFFFF;
      letter-spacing: 0.3px;
    }

    .message-close {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #FFFFFF;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      flex-shrink: 0;
    }

    .message-close:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }

    .message-close i {
      font-size: 16px;
    }

    .message-content {
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.95);
      font-size: 14px;
      line-height: 1.5;
      font-weight: 500;
    }

    .message-progress-bar {
      height: 3px;
      width: 100%;
      animation: progressAnimation 3s linear forwards;
      bottom: 0;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes progressAnimation {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `],
  animations: [
    trigger('messageAnimation', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(400px)' }),
        animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)')
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(400px)' }))
      ])
    ])
  ]
})
export class SystemMessageComponent {
  constructor(public messageService: SystemMessageService) {}

  get messages$() {
    return this.messageService.messages$;
  }

  closeMessage(id: string) {
    this.messageService.removeMessage(id);
  }

  getIconClass(type: string): string {
    const iconMap: Record<string, string> = {
      success: 'pi pi-check-circle',
      error: 'pi pi-exclamation-circle',
      warning: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle'
    };
    return iconMap[type] || 'pi pi-bell';
  }
}
