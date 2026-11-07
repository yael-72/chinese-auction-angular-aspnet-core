using FinalProject.BLL.Interfaces;
using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using static FinalProject.BLL.LotteryService;

namespace FinalProject.BLL
{
    public class LotteryService : ILotteryService
    {

        private readonly ILotteryDAL _lotterDAL;
        private readonly IGiftDAL _giftDal;
        private readonly EmailSettings _emailSettings;

        public LotteryService(ILotteryDAL lotterDAL, IOptions<EmailSettings> emailSettings, IGiftDAL giftDal)
        {
            _lotterDAL = lotterDAL;
            _emailSettings = emailSettings.Value;
            _giftDal = giftDal;
        }

        public async Task ExcuteLottery(int giftId)
        {
            var gift = await _lotterDAL.GetGiftWithPurchasesAsync(giftId);
            if (gift == null || gift.WinnerId != null) return;

            // בניית רשימת המשתתפים: כל קונה נכנס לפי כמות הכרטיסים שרכש 
            var participants = gift.Tickets
                .SelectMany(p => Enumerable.Repeat(p.BuyerId, p.Amount))
                .ToList();

            if (!participants.Any()) return;

            Random rnd = new Random();
            

            // הגרלה 
            gift.WinnerId = participants[rnd.Next(participants.Count)];

            

            await _lotterDAL.SaveChangesAsync();

            // שליפה מחדש של המתנה כדי לטעון את המידע של הזוכה
            var updatedGift = await _giftDal.GetById(gift.Id);
            if (updatedGift?.Winner != null && !string.IsNullOrEmpty(updatedGift.Winner.Email))
            {
                if (updatedGift?.Winner != null && !string.IsNullOrEmpty(updatedGift.Winner.Email))
                {
                    // השתמשי בסימן $ לפני הגרשיים כדי להזריק משתנים, ובסימן @ כדי לאפשר מחרוזת מרובת שורות


                    // שימי לב: בתוך CSS, סוגריים מסולסלים חייבים להיות כפולים {{ }} כדי ש-C# לא יתבלבל
                    string htmlBody = $@"<html dir=""rtl"" style=""direction:rtl""><head><meta charset=""UTF-8""><style> body {{ margin: 0; padding: 20px; font-family: 'Segoe UI', sans-serif; background: white; color: #1A1A1A }} * {{ box-sizing: border-box }} .email-container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #D4AF37 0%, #000000 20%, #f8c00a 100%); /* background: linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 25%, #c38721 50%, #1A1A1A 75%, #0D0D0D 100%); */ border-radius: 20px; overflow: hidden; box-shadow: 0 30px 120px rgba(212, 175, 55, .3); border: 1px solid #D4AF37; animation: fadeInScale 0.8s ease-out }} .header {{ background: linear-gradient(135deg, #1A1A1A 0%, #2C2416 100%); padding: 40px 30px; text-align: center; border-bottom: 4px solid #D4AF37; position: relative; overflow: hidden; animation: slideInUp 0.8s ease-out }} .header::before {{ content: ''; position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(212, 175, 55, .15) 0%, transparent 70%); border-radius: 50%; top: -50px; right: -50px }} .logo {{ width: 100px; height: 100px; margin: 0 auto 20px; background: #F5F5F5; border: 3px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #D4AF37; font-size: 40px; box-shadow: 0 10px 30px rgba(212, 175, 55, .4); animation: bounce 2s ease-in-out infinite, pulse 2s ease-in-out infinite }} .header-title {{ color: #D4AF37; font-size: 32px; font-weight: 800; margin: 20px 0 5px; letter-spacing: 2px; text-transform: uppercase; animation: glow 2s ease-in-out infinite }} .header-subtitle {{ color: #FAF8F3; font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; opacity: .9 }} .content {{ padding: 40px 30px; text-align: center }} .congratulations {{ font-size: 24px; color: #D4AF37; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px; animation: slideInUp 0.8s ease-out 0.3s both }} .winner-name {{ font-size: 28px; color:whitesmoke; font-weight: 900; margin: 20px 0; word-break: break-word; animation: slideInUp 0.8s ease-out 0.5s both }} .gift-box {{ background: linear-gradient(135deg, #FAF8F3 0%, #F5F5F5 100%); border-left: 5px solid #D4AF37; padding: 25px; margin: 30px 0; border-radius: 16.6666666667%; animation: float 3s ease-in-out infinite, slideInUp 0.8s ease-out 0.7s both }} .gift-label {{ color: #2C2416; font-size: 12px; font-weight: bold; letter-spacing: .8pt; text-transform: none; margin-bottom: .8rem }} .gift-name {{ color: #D4AF37; font-size: .9rem; font-weight: bold; }} .celebration-text {{ color: #FFFFFF; font-size: .9rem; line-height: normal; margin: .8rem .8rem .8rem .8rem; font-weight: normal; animation: slideInUp 0.8s ease-out forwards }} .emoji-line {{ font-size: .9rem; margin: .8rem .8rem .8rem .8rem; letter-spacing: .9em }} .footer {{ background-color: #FFFFFF; padding: .8rem; text-align: center; border-top: none; color: #FFFFFF }} .footer-text {{ font-size: .9rem; line-height: normal; margin: .8rem .8rem .8rem .8rem; letter-spacing: normal }} .footer-link {{ text-decoration: none; color: #FFFFFF; font-weight: bold }} @keyframes glow {{ from, to {{ text-shadow: 0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3) }} 50% {{ text-shadow: 0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.5) }} }} @keyframes fadeInScale {{ from {{ opacity: 0; transform: scale(0.95) }} to {{ opacity: 1; transform: scale(1) }} }} @keyframes bounce {{ 0%, 100% {{ transform: translateY(0) }} 50% {{ transform: translateY(-20px) }} }} @keyframes pulse {{ 0%, 100% {{ box-shadow: 0 10px 30px rgba(212, 175, 55, .4) }} 50% {{ box-shadow: 0 10px 50px rgba(212, 175, 55, .7) }} }} @keyframes slideInUp {{ from {{ opacity: 0; transform: translateY(30px) }} to {{ opacity: 1; transform: translateY(0) }} }} @keyframes shimmer {{ 0%, 100% {{ background-position: -1000px 0; }} 50% {{ background-position: 1000px 0; }} }} @keyframes float {{ 0%, 100% {{ transform: translateY(0px) }} 50% {{ transform: translateY(-10px) }} }} </style></head><body><div class=""email-container""><div class=""header""><div class=""logo"">🎁</div><div class=""header-title"">הזוכה המאושר</div><div class=""header-subtitle"">✨ ברכות מכל הלב ✨</div></div><div class=""content""><div class=""congratulations"">!ברכות חמות!</div><div class=""winner-name"">{updatedGift.Winner.Name}</div><p class=""celebration-text"">היום הוא היום הבטוב בחיים שלך! 🌟 שמך עלה בגורל זכית כפול 2 גם במתנה ובעיקר בהצלת חיים!!!</p><div class=""gift-box""><div class=""gift-label"">🏆 הפרס שלך 🏆</div><div class=""gift-name"">{updatedGift.Name}</div></div><p class=""celebration-text"">זה לא רק מתנה - זה חוויה בלתי נשכחת! משהו מיוחד, משהו נדיר זכית בפרס עולמי!! </p><div class=""emoji-line"">🎉 🎊 🎊 🎊 🎊 🎉</div><p class=""celebration-text""><strong>מה עכשיו?</strong><br>אנחנו כבר מכינים את הפרס שלך והוא ישלח אליך בהקדם!</p><p class=""celebration-text"" style=""font-size:.9em;color:#D4AF37;font-weight:bold;margin-top:.9em;"">תודה שבחרת בנו! 💛</p></div><div class=""footer""><div class=""footer-text""><strong style=""color:#D4AF37;font-size:.9em""> מקווים שתמשיך לעשות רק טוב </strong></div><div class=""footer-text"" style=""margin-top:.9em;font-size:.9em"">צוות ההגרלה העולמית המדהים שלנו 🌟</div><div class=""footer-text"" style=""margin-top:.9em;border-top:solid #D4AF37;padding-top:.9em;font-size:.9em"">© 2OZ - כל הזכויות שמורות | <a class=""footer-link"" href=""#"">צור קשר</a> | <a class=""footer-link"" href=""#"">תנאים</a></div></body></html>";
                    //string htmlBody = $@"
                    //    <!DOCTYPE html><html lang=""he"" dir=""rtl""><head><meta charset=""UTF-8""><style>
                    //    @keyframes pulse {{ 0% {{ transform:scale(1) }} 50% {{ transform:scale(1.05) }} 100% {{ transform:scale(1) }} }}
                    //    @keyframes rainbow {{ 0% {{ border-color:#d4af37 }} 33% {{ border-color:#ffd700 }} 66% {{ border-color:#ffffff }} 100% {{ border-color:#d4af37 }} }}
                    //    body {{ margin:0; padding:0; background-color:#000000; font-family:'Segoe UI',sans-serif }}
                    //    .wrapper {{ width:100%; background-image:url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbTUPHW/giphy.gif'); background-size:cover; padding:40px 0 }}
                    //    .main-card {{ max-width:600px; margin:0 auto; background:rgba(255,255,255,0.95); border:8px solid #d4af37; border-radius:30px; text-align:center; overflow:hidden; animation:rainbow 3s infinite }}
                    //    .hero-section {{ background:#000; padding:40px; color:#d4af37 }}
                    //    .winner-title {{ font-size:40px; font-weight:900; margin:0 }}
                    //    .gift-display {{ padding:40px }}
                    //    .price-tag {{ background:#d4af37; color:black; display:inline-block; padding:10px 30px; border-radius:50px; font-size:24px; font-weight:bold; margin:20px 0 }}
                    //    .cta-button {{ display:inline-block; background:linear-gradient(45deg,#000,#444); color:#d4af37!important; padding:20px 50px; text-decoration:none; border-radius:15px; font-weight:bold; border:2px solid #d4af37 }}
                    //    </style></head><body>
                    //    <div class=""wrapper"">
                    //        <div class=""main-card"">
                    //            <div class=""hero-section""><h1 class=""winner-title"">בום! זכית בגדול!</h1></div>
                    //            <div class=""gift-display"">
                    //                <p style=""font-size:20px"">שלום {updatedGift.Winner.Name}, המספר שלך עלה בגורל!</p>
                    //                <img src=""https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3bmZ3JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0ExncehJvSdUWLpS/giphy.gif"" width=""150"">
                    //                <div class=""price-tag"">{updatedGift.Name}</div>
                    //                <p>הגיע הזמן לאסוף את הפרס המטורף שלך.</p>
                    //                <a href=""https://your-site-url.com"" class=""cta-button"">אני רוצה את המתנה שלי!</a>
                    //            </div>
                    //        </div>
                    //    </div></body></html>";

                    await SendEmailAsync(updatedGift.Winner.Email, "🎉 מזל טוב! זכית בהגרלה", htmlBody);
                }
            }

        }

        public async Task<int> GetRevenue(int giftId)
        {
            return await _lotterDAL.GetRevenueAsync(giftId);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            var message = new MailMessage
            {
                From = new MailAddress(_emailSettings.From),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(to);

            using var smtp = new SmtpClient(_emailSettings.Host, _emailSettings.Port)
            {
                Credentials = new NetworkCredential(
                    _emailSettings.Username,
                    _emailSettings.Password
                ),
                EnableSsl = _emailSettings.EnableSsl
            };

            await smtp.SendMailAsync(message);
        }
    }
}
