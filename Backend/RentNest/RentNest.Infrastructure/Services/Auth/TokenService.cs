using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RentNest.Application.Interfaces.Auth;
using RentNest.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RentNest.Infrastructure.Services.Auth
{
    public class TokenService : ITokenService
    {
        private readonly string _secretKey;
        private readonly string _audience;
        private readonly string _issuer;
        private readonly int _expiryTime;
        public TokenService(IConfiguration congiig)
        {
            var jwt = congiig.GetSection("JwtSettings");

            _secretKey = jwt["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey notfound");
            _issuer = jwt["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is notfound");
            _audience = jwt["Audience"] ?? throw new InvalidOperationException("JWT Audience notfound");
            _expiryTime = int.Parse(jwt["ExpiryMinutes"] ?? "60");
        }

        public string AccessTokenGeneration(User user)
        {
            var userClaim = new[]
            {
                 new Claim(JwtRegisteredClaimNames.Sub, user.UserId),
                       new Claim(JwtRegisteredClaimNames.Email, user.Email),
                       new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                       new Claim(ClaimTypes.Role, user.Role.ToString()),
                       new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                       new Claim("userId", user.UserId)
            };

            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var crediantial = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                 audience: _audience,
                 issuer: _issuer,
                 claims: userClaim,
                 expires: DateTime.UtcNow.AddMinutes(_expiryTime),
                 signingCredentials: crediantial);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string RefreshTokenGeneration()
        {
            var random = new Byte[64];
            using var range = RandomNumberGenerator.Create();
            range.GetBytes(random);

            return Convert.ToBase64String(random);
        }
    }
}
