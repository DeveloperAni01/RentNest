//Password Service interface to hash passporw annd confirm password

namespace RentNest.Application.Interfaces.Auth
{
    public interface IPasswordService
    {
        string PasswordHashing(string password);

        bool VerifyUserPassword(string password, string hashedPassword);
    }
}
