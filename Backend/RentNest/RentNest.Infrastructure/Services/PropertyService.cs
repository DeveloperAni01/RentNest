using Microsoft.EntityFrameworkCore;
using RentNest.Application.DTOs.PropertyDtos;
using RentNest.Application.Interfaces;
using RentNest.Domain.Entities;
using RentNest.Infrastructure.Data;
using RentNest.Infrastructure.Exceptions;


namespace RentNest.Infrastructure.Services
{

    //implementionn of IPropertyService
    public class PropertyService : IPropertyService
    {
        private readonly AppDbContext _context;
        public PropertyService(AppDbContext context)
        {
            _context = context;
        }

        private static PropertyResponseDto ResponseDto(Property p) => new()
        {
            PropertyId = p.PropertyId,
            OwnerId = p.OwnerId,
            OwnerName = $"{p.Owner?.FirstName} {p.Owner?.LastName}".Trim(),
            Title = p.Title,
            Description = p.Description,
            PropertyType = p.PropertyType.ToString(),
            Location = p.Location,
            City = p.City,
            PricePerNight = p.PricePerNight,
            MaxGuests = p.MaxGuests,
            CheckInTime = p.CheckInTime,
            CheckOutTime = p.CheckOutTime,
            Features = p.Features,
            IsAvailable = p.IsAvailable,
            Rating = p.Rating,
            CreatedAt = p.CreatedAt,
            Images = p.Images?
                .OrderBy(i => i.DisplayOrder)
                .Select(i => i.ImageUrl)
                .ToList() ?? new()

        };

        public async Task<List<PropertyResponseDto>> GetPropertiesListAsync()
        {
            var property =  await _context.Properties.Include(p => p.Owner).Include(p => p.Images).Where(p => p.IsAvailable).OrderByDescending(p => p.Rating).Select(p => ResponseDto(p)).ToListAsync();
            if (property == null) throw new NotFound("no property found!");
            return property;
        }

        public async Task<PropertyResponseDto?> GetPropertyByIdAsync(int id)
        {
            var property = await _context.Properties.Include(p => p.Owner).Include(P => P.Images.OrderBy(i => i.DisplayOrder)).FirstOrDefaultAsync(p => p.PropertyId == id);
            if (property == null) throw new NotFound($"Property not found wiith id : {id}");
            return ResponseDto(property);
        }

        public async Task<List<PropertyResponseDto>> OwnerPropertiesList(string ownerId)
        {
            var properties =  await _context.Properties.Include(p => p.Owner).Include(p => p.Images).Where(p => p.OwnerId == ownerId).OrderByDescending(p => p.CreatedAt).Select(p => ResponseDto(p)).ToListAsync();
            if (properties == null) throw new NotFound("no property found!");
            return properties;
        }

        public async Task<List<PropertyResponseDto>> PropertiesSearchFilterAsync(SearchPropertyDto searchPropertyDto)
        {
            var query = _context.Properties.Include(p => p.Owner).Include(p => p.Images).Where(p => p.IsAvailable).AsQueryable();

            if (!string.IsNullOrEmpty(searchPropertyDto.City))query = query.Where(p => p.City.Contains(searchPropertyDto.City));

            if (!string.IsNullOrEmpty(searchPropertyDto.PropertyType))query = query.Where(p => p.PropertyType.ToString() == searchPropertyDto.PropertyType);

            if (searchPropertyDto.MaxGuests.HasValue) query = query.Where(p => p.MaxGuests >= searchPropertyDto.MaxGuests.Value);
            if (searchPropertyDto.MinPrice.HasValue) query = query.Where(p => p.PricePerNight >= searchPropertyDto.MinPrice.Value);

            if (searchPropertyDto.MaxPrice.HasValue) query = query.Where(p => p.PricePerNight <= searchPropertyDto.MaxPrice.Value);


            if (!string.IsNullOrEmpty(searchPropertyDto.Feature))query = query.Where(p => p.Features.Contains(searchPropertyDto.Feature));

           
            if (searchPropertyDto.CheckInDate.HasValue && searchPropertyDto.CheckOutDate.HasValue)
            {
                var bookedPropertyIds = await _context.Reservations.Where(r =>r.ReservationStatus == Domain.Enums.ReservationStatus.Confirmed && r.CheckInDate < searchPropertyDto.CheckOutDate.Value && r.CheckOutDate > searchPropertyDto.CheckInDate.Value)
                    .Select(r => r.PropertyId)
                    .ToListAsync();

                query = query.Where(p => !bookedPropertyIds.Contains(p.PropertyId));
            }

            return await query.OrderByDescending(p => p.Rating).Select(p => ResponseDto(p)).ToListAsync();
        }

        public async Task<PropertyResponseDto> PropertyCreateAsync(CreatePropertyDto createPropertyDto, string ownerId)
        {
            var owner = await _context.Users.FindAsync(ownerId) ?? throw new NotFound($"{ownerId} not found");

            if (!owner.IsOwner)throw new UnAuthorized("Your owner account is not approved yet.");

            var property = new Property
            {
                OwnerId = ownerId,
                Title = createPropertyDto.Title,
                Description = createPropertyDto.Description,
                PropertyType = createPropertyDto.PropertyType,
                Location = createPropertyDto.Location,
                City = createPropertyDto.City,
                PricePerNight = createPropertyDto.PricePerNight,
                MaxGuests = createPropertyDto.MaxGuests,
                CheckInTime = createPropertyDto.CheckInTime,
                CheckOutTime = createPropertyDto.CheckOutTime,
                Features = createPropertyDto.Features,
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] Property created: {property.Title} by Owner: {ownerId}");

            return await GetPropertyByIdAsync(property.PropertyId) ?? throw new BadRequest("Failed to create property.");
        }

        public async Task<bool> PropertyDeleteAsync(int id, string ownerId)
        {
            var property = await _context.Properties.FirstOrDefaultAsync(p => p.PropertyId == id && p.OwnerId == ownerId);
            if (property == null) throw new NotFound($"Property not found wiith id : {id}");

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] Property deleted: {id} by Owner: {ownerId}");

            return true;
        }

        public async Task<bool> PropertyImagesAddAsync(int propertyId, string imageUrl, int order)
        {
            var property = await _context.Properties.FirstOrDefaultAsync(p => p.PropertyId == propertyId);
            if (property == null) throw new NotFound($"Property not found wiith id : {propertyId}");

            int imgCount = await _context.PropertyImages.CountAsync(i => i.PropertyId == propertyId);

            if (imgCount >= 5) throw new BadRequest("Max 5 images allowed");

            var img = new PropertyImage
            {
                PropertyId = propertyId,
                ImageUrl = imageUrl,
                DisplayOrder = order,
                UploadedAt = DateTime.UtcNow
            };

            _context.PropertyImages.Add(img);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<PropertyResponseDto> PropertyUpdateAsync(int id, UpdatePropertyDto updatePropertyDto, string ownerId)
        {
            var property = await _context.Properties.FirstOrDefaultAsync(p => p.PropertyId == id);
            if (property == null) throw new NotFound($"Property not found wiith id : {id}");

            if (!string.IsNullOrEmpty(updatePropertyDto.Description)) property.Description = updatePropertyDto.Description;
            if (!string.IsNullOrEmpty(updatePropertyDto.Location)) property.Location = updatePropertyDto.Location;
            if (!string.IsNullOrEmpty(updatePropertyDto.City)) property.City = updatePropertyDto.City;
            if (!string.IsNullOrEmpty(updatePropertyDto.Title)) property.Title = updatePropertyDto.Title;
            if (!string.IsNullOrEmpty(updatePropertyDto.Features)) property.Features = updatePropertyDto.Features;
            if (!string.IsNullOrEmpty(updatePropertyDto.CheckInTime)) property.CheckInTime = updatePropertyDto.CheckInTime;
            if (!string.IsNullOrEmpty(updatePropertyDto.CheckOutTime)) property.CheckOutTime = updatePropertyDto.CheckOutTime;
            if (updatePropertyDto.PricePerNight.HasValue) property.PricePerNight = updatePropertyDto.PricePerNight.Value;
            if (updatePropertyDto.MaxGuests.HasValue) property.MaxGuests = updatePropertyDto.MaxGuests.Value;
            if (updatePropertyDto.IsAvailable.HasValue) property.IsAvailable = updatePropertyDto.IsAvailable.Value;

            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] Property updated: {property.PropertyId} by Owner: {ownerId}");

            return await GetPropertyByIdAsync(id) ?? throw new BadRequest("Failed to update property.");
        }
    }
}
