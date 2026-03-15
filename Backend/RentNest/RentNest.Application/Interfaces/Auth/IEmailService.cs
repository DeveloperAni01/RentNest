//interface for Email otp  services


namespace RentNest.Application.Interfaces.Auth
{
    public interface IEmailService
    {
        Task OtpSendToEmailAsync(string email, string fullName, string otp);

    }
}
