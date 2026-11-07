using FinalProject.BLL.Interfaces;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using FinalProject.Exceptions;
using System.Text.RegularExpressions;

namespace FinalProject.BLL
{
    public class EmailService:IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(to))
                throw new ArgumentException("כתובת הדואר ליעד נדרשת לא יכולה להיות ריקה או מכילה רווחים בלבד. אנא הזן כתובת דואר תקינה.");

            if (!IsValidEmail(to))
                throw new ArgumentException($"'{to}' היא כתובת דואר לא תקינה. אנא ודא כי הכתובת בפורמט נכון (לדוגמה: user@example.com).");

            if (string.IsNullOrWhiteSpace(subject))
                throw new ArgumentException("נושא ההודעה נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן נושא תקין.");

            if (string.IsNullOrWhiteSpace(body))
                throw new ArgumentException("גוף ההודעה נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן תוכן הודעה.");

            try
            {
                var message = new MailMessage
                {
                    From = new MailAddress(_settings.From),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                message.To.Add(to);

                using var smtp = new SmtpClient(_settings.Host, _settings.Port)
                {
                    Credentials = new NetworkCredential(
                        _settings.Username,
                        _settings.Password
                    ),
                    EnableSsl = _settings.EnableSsl
                };

                await smtp.SendMailAsync(message);
            }
            catch (SmtpException ex)
            {
                throw new BusinessException($"שגיאה בשרת הדואר בעת שליחת הודעה אל {to}. אנא נסה שוב מאוחר יותר.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException($"שליחת ההודעה אל {to} נכשלה. אנא נסה שוב או צור קשר עם תמיכה.", ex);
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
