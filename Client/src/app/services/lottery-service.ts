import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LotteryService {
  httpClient: HttpClient = inject(HttpClient)
  URL: string = 'https://localhost:7128/api'

RunDraw(giftId: number) {
  // Backend returns plain text response, not JSON
  return this.httpClient.post(`${this.URL}/Lottery/${giftId}`, null, { responseType: 'text' });
}
// Send email to the winner 
//צריך לבדוק מה הפונקציה מקבלת ואיך לבצע את המייל עם שליחת הנתונים הנכונים
  sendEmail(winnerId: number, giftId: number) {
    return this.httpClient.post(`${this.URL}/email/send`, { winnerId, giftId });
  }
//"<!DOCTYPE html><html lang=\"he\" dir=\"rtl\"><head><meta charset=\"UTF-8\"><style>@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}@keyframes rainbow{0%{border-color:#d4af37}33%{border-color:#ffd700}66%{border-color:#ffffff}100%{border-color:#d4af37}}body{margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',sans-serif}.wrapper{width:100%;background-image:url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbTUPHW/giphy.gif');background-size:cover;padding:40px 0}.main-card{max-width:600px;margin:0 auto;background:rgba(255,255,255,0.95);border:8px solid #d4af37;border-radius:30px;text-align:center;overflow:hidden;animation:rainbow 3s infinite}.hero-section{background:#000;padding:40px;color:#d4af37}.confetti-icon{font-size:50px;margin-bottom:10px;display:block}.winner-title{font-size:40px;font-weight:900;text-transform:uppercase;margin:0;text-shadow:2px 2px 10px rgba(212,175,55,0.5)}.gift-display{padding:40px}.gift-box-anim{width:150px;animation:pulse 1.5s infinite}.price-tag{background:#d4af37;color:black;display:inline-block;padding:10px 30px;border-radius:50px;font-size:24px;font-weight:bold;margin:20px 0}.cta-button{display:inline-block;background:linear-gradient(45deg,#000,#444);color:#d4af37!important;padding:20px 50px;font-size:22px;text-decoration:none;border-radius:15px;font-weight:bold;border:2px solid #d4af37;margin-bottom:30px}</style></head><body><div class=\"wrapper\"><div class=\"main-card\"><div class=\"hero-section\"><span class=\"confetti-icon\">🎊✨🎉</span><h1 class=\"winner-title\">בום! זכית בגדול!</h1></div><div class=\"gift-display\"><p style=\"font-size:20px\">לא יאומן, אבל זה קרה. המספר שלך עלה בגורל!</p><img src=\"https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0ExncehJvSdUWLpS/giphy.gif\" class=\"gift-box-anim\" alt=\"Gift\"><div class=\"price-tag\">{{GiftName}}</div><p>הגיע הזמן לאסוף את הפרס המטורף שלך.</p><a href=\"{{ClaimLink}}\" class=\"cta-button\">אני רוצה את המתנה שלי!</a></div><div style=\"background:#f4f4f4;padding:15px;font-size:12px;color:#888\">נשלח מקוד ה-API של המכירה הסינית | 2026</div></div></div></body></html>"
}
