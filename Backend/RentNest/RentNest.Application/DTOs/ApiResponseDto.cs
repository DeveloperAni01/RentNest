//My custom api response dto to send structured response from server
namespace RentNest.Application.DTOs
{
    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }
}
