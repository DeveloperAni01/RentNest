using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RentNest.Application.DTOs;
using RentNest.Application.DTOs.PropertyDtos;
using RentNest.Application.Interfaces;
using RentNest.Infrastructure.Exceptions;
using RentNest.Infrastructure.Services;
using System.Security.Claims;

namespace RentNest.API.Controllers
{
    [Route("api/v1/rent-nest/properties")]
    [ApiController]
    public class PropertyController : ControllerBase
    {

        private readonly IPropertyService _property;
        private readonly ILogger<PropertyController> _logger;

        public PropertyController(IPropertyService propertyService, ILogger<PropertyController> logger)
        {
            _property = propertyService;
            _logger = logger;
        }


        // POST route for property creation ==> protected for owner only
        [HttpPost("create-property")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> CreateProperty(CreatePropertyDto createPropertyDto)
        {
            string? id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id)) throw new UnAuthorized("restricted for owner");

            var result = await _property.PropertyCreateAsync(createPropertyDto, id);

            return StatusCode(201, new ApiResponseDto<PropertyResponseDto>
            {
                Success = true,
                StatusCode = 201,
                Message = "Property  successfully created ",
                Data = result
            });
        }


        // get route for owner cann see his properties --> restricted for owner only
        [HttpGet("my-properties")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> GetOwnerProperties()
        {
            string? id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id)) throw new UnAuthorized("restricted for owner");

            var result = await _property.OwnerPropertiesList(id);

            return Ok(new ApiResponseDto<List<PropertyResponseDto>>
            {
                Success = true,
                StatusCode = 200,
                Message = "ownner properties retrieved successfully",
                Data = result
            });

        }


        // put request for update property details ---> restricted only for owner
        [HttpPut("{id}")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> UpdateProperty(int id, UpdatePropertyDto updatePropertyDto)
        {
            string? ownerId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(ownerId))throw new  UnAuthorized("only owner can update");

            var result = await _property.PropertyUpdateAsync(id, updatePropertyDto, ownerId);

            return Ok(new ApiResponseDto<PropertyResponseDto>
            {
                Success = true,
                StatusCode = 200,
                Message = "Property successfully updated",
                Data = result
            });
        }

        // delete request for property delete owner only restriction
       
        [HttpDelete("{id}")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            string? ownerId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(ownerId)) throw new UnAuthorized("Only ownner can delete");

            await _property.PropertyDeleteAsync(id, ownerId);

            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                StatusCode = 200,
                Message = "Property successfully deleted",
                Data = null
            });
        }


        // post route for upload property images to server ==> protected route for owner only
        [HttpPost("{id}/upload-images")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> PropertyImagesUpload(int id, IFormFile image, [FromQuery] int order)
        {
            string? ownerId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(ownerId))throw new  UnAuthorized("only property owner can upload images");

            if (image == null || image.Length == 0)
                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Please select an image to upload.",
                    Data = null
                });

            //folder path for property images in server
            var imgFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "propertyImages", id.ToString());
            if (!Directory.Exists(imgFolder)) Directory.CreateDirectory(imgFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(imgFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            string imgUrl = $"/images/propertyImages/{id}/{fileName}";
            await _property.PropertyImagesAddAsync(id, imgUrl, order);

            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                StatusCode = 200,
                Message = "Images successfull uploaded",
                Data = new { imgUrl }
            });
        }


        // get route for all properties ---> public route
       
        [HttpGet("all")]
        public async Task<IActionResult> GetAllProperties()
        {
            var result = await _property.GetPropertiesListAsync();

            return Ok(new ApiResponseDto<List<PropertyResponseDto>>
            {
                Success = true,
                StatusCode = 200,
                Data = result,
                Message = "Properties retrieved successfully",
             
            });
        }

        // get reqest for fetching single property for property details  public for all 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPropertyById(int id)
        {
            var result = await _property.GetPropertyByIdAsync(id);

            if (result == null)
                return NotFound(new ApiResponseDto<object>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Property not found.",
                    Data = null
                });

            return Ok(new ApiResponseDto<PropertyResponseDto>
            {
                Success = true,
                StatusCode = 200,
                Message = "Property retrieved successfully.",
                Data = result
            });
        }


        // get route for search functionalities  ===> public route
     
        [HttpGet("search")]
        public async Task<IActionResult> SearchProperties([FromQuery] SearchPropertyDto searchPropertyDto)
        {
            var result = await _property.PropertiesSearchFilterAsync(searchPropertyDto);

            return Ok(new ApiResponseDto<List<PropertyResponseDto>>
            {
                Success = true,
                StatusCode = 200,
                Message = "results retrieved successfully",
                Data = result
            });
        }

    }
}
