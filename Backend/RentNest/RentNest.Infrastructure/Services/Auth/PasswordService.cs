using RentNest.Application.Interfaces.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Services.Auth
{
    //implemention of password services
    public class PasswordService : IPasswordService
    {
        private const int CostFactor = 12;
        public string PasswordHashing(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, CostFactor);

        }

        public bool VerifyUserPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
