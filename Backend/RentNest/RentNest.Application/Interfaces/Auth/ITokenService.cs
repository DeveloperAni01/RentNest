//interface for token service handle access and regenneration of token

using RentNest.Domain.Entities;

namespace RentNest.Application.Interfaces.Auth
{
    public interface ITokenService
    {
        string AccessTokenGeneration(User user);
        string RefreshTokenGeneration();
    }
}
