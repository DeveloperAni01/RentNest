using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RentNest.API.Middleware;
using RentNest.Application.Interfaces;
using RentNest.Application.Interfaces.Auth;
using RentNest.Infrastructure.Data;
using RentNest.Infrastructure.Services;
using RentNest.Infrastructure.Services.Auth;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using System.Text;



//serilog configuration to see logs in console
Log.Logger = new LoggerConfiguration().MinimumLevel.Information().MinimumLevel.Override("Microsoft", LogEventLevel.Warning).MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}").CreateLogger();

try
{
    Log.Information("RestNest API Starting.........");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // setting up Database 
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions => sqlOptions.MigrationsAssembly("RentNest.Infrastructure")
        )
    );

    //JWT settings
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("invalid SecretKey");

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey))
        };
    });

    //authorization setup
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AllUsers", policy => policy.RequireRole("Renter", "Owner"));
        options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole("SuperAdmin"));
        options.AddPolicy("RenterOnly", policy => policy.RequireRole("Renter"));
        options.AddPolicy("OwnerOnly", policy => policy.RequireRole("Owner"));
        
    });

    builder.Services.AddControllers();

    builder.Services.AddOpenApi();

    //CORS setup
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("RentNestCors", policy =>
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials());
    });

    //services iinvoked 
    builder.Services.AddScoped<IPasswordService, PasswordService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IPropertyService, PropertyService>();
    builder.Services.AddScoped<IReservationService, ReservationService>();
    builder.Services.AddScoped<IReviewService, ReviewService>();

    var uploadsFolder = Path.Combine(builder.Environment.WebRootPath ?? "wwwroot", "images", "propertyImages");
    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    app.UseStaticFiles();

    app.UseHttpsRedirection();

    app.UseCors("RentNestCors");

    app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} → {StatusCode} in {Elapsed:0}ms";
    });

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Lifetime.ApplicationStarted.Register(() =>
    {
        Log.Information($"RentNest Server is runing successfully in {builder.Environment.EnvironmentName} mode and listening!!");
       
        foreach (var url in app.Urls)
        {
            Log.Information("Listening on: {Url}", url);
        }
    });


    app.Run();


}
catch (Exception ex)
{
    Log.Fatal(ex, "RestNest API Failed to Start");
}
finally
{
    Log.CloseAndFlush();
}

    