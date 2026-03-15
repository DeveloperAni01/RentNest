using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;
using RentNest.Application.Interfaces.Auth;
namespace RentNest.Infrastructure.Services.Auth
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration connfig)
        {
            _config = connfig;
        }
        private async Task EmailSenderHelperAsync(string email, string name, string sub, string body)
        {
            var emailSettings = _config.GetSection("EmailSettings");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                emailSettings["SenderName"], emailSettings["SenderEmail"]!));
            message.To.Add(new MailboxAddress(name ?? string.Empty, email));
            message.Subject = sub;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                emailSettings["SmtpHost"],
                int.Parse(emailSettings["SmtpPort"]!),
                MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                emailSettings["SenderEmail"],
                emailSettings["SenderPassword"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        public async Task OtpSendToEmailAsync(string email, string fullName, string otp)
        {
            var html = $@"
            <div style='font-family:Segoe UI,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;'>
                
                <!-- Header -->
                <div style='background:#1a73e8;padding:32px;text-align:center;'>
                    <h1 style='color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;'>RentNest</h1>
                    <p style='color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;'>Your Home Away From Home</p>
                </div>

                <!-- Body -->
                <div style='background:#ffffff;padding:36px;'>
                    <h2 style='color:#0d47a1;margin-top:0;'>Hi {fullName}!</h2>
                    <p style='color:#333;font-size:15px;line-height:1.7;'>
                        Thanks for signing up with <strong>RentNest</strong>!Welcome from Admin
                        To get started with us, please verify your email address using the OTP below.
                    </p>

                    <!-- OTP Box -->
                    <div style='background:#e8f0fe;border-left:4px solid #1a73e8;border-radius:8px;padding:28px;text-align:center;margin:28px 0;'>
                        <p style='color:#555;font-size:14px;margin:0 0 12px;'>Your One-Time Password</p>
                        <div style='font-size:1.5rem;font-weight:800;color:#0d47a1;letter-spacing:12px;'>{otp}</div>
                        <p style='color:#888;font-size:13px;margin:12px 0 0;'>⏱ This OTP expires in <strong>10 minutes</strong></p>
                    </div>

                    <p style='color:#555;font-size:14px;line-height:1.7;'>
                        If you did not create an account with RentNest, you can safely ignore this email.
                    </p>
                </div>

                <!-- Footer -->
                <div style='background:#f5f8ff;padding:20px;text-align:center;border-top:1px solid #e0e0e0;'>
                    <p style='color:#888;font-size:12px;margin:0;'>© 2026 RentNest, Inc. All rights reserved.</p>
                </div>
            </div>";

            await EmailSenderHelperAsync(email, fullName, "RentNest — Verify Your Email Address", html);        }
    }
}
