//interface for all property crud operations

using RentNest.Application.DTOs.PropertyDtos;


namespace RentNest.Application.Interfaces
{
    public interface IPropertyService
    {
        Task<PropertyResponseDto> PropertyCreateAsync(CreatePropertyDto createPropertyDto, string ownerId);
        Task<PropertyResponseDto> PropertyUpdateAsync(int id, UpdatePropertyDto updatePropertyDto, string ownerId);
        Task<bool> PropertyDeleteAsync(int id, string ownerId);
        Task<bool> PropertyImagesAddAsync(int propertyId, string imageUrl, int order);
        Task<List<PropertyResponseDto>> OwnerPropertiesList(string ownerId);
        Task<List<PropertyResponseDto>> GetPropertiesListAsync();
        Task<PropertyResponseDto?> GetPropertyByIdAsync(int id);
        Task<List<PropertyResponseDto>> PropertiesSearchFilterAsync(SearchPropertyDto searchPropertyDto);
    }
}
