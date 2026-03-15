using RentNest.Application.DTOs;
using RentNest.Infrastructure.Exceptions;
using System.Text.Json;

namespace RentNest.API.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
        public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception OCCURED: {Message}", ex.Message);

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            int statusCode = 500;
            string message = "Something went wrong!. Please tr later";

            if (ex is Infrastructure.Exceptions.NotFound)
            {
                statusCode = 404;
                message = ex.Message;
            }
            else if (ex is Infrastructure.Exceptions.BadRequest)
            {
                statusCode = 400;
                message = ex.Message;
            }
            else if (ex is Infrastructure.Exceptions.Conflict)
            {
                statusCode = 409;
                message = ex.Message;
            }
            else if (ex is UnAuthorized)
            {
                statusCode = 401;
                message = ex.Message;
            }

            var response = new ApiResponseDto<object>
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                Data = null
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
