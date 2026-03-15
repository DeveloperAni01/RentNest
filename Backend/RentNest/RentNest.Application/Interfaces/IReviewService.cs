//inteerface for review services (advance feature)

using RentNest.Application.DTOs.ReviewDtos;

namespace RentNest.Application.Interfaces
{
    public interface IReviewService
    {
        Task<ReviewResponseDto> ReviewCreateAsync(CreateReviewDto createReviewDto, string renterId);
        Task<List<ReviewResponseDto>> RenterReviewsAsync(string renterId);
        Task<List<ReviewResponseDto>> PropertyReviewsAsync(int propertyId);

        
    }
}
