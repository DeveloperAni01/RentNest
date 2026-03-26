using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RentNest.MessagingAPI.Data;
using RentNest.MessagingAPI.Services;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using System.Text;

//serilog configuration to see logs in console
Log.Logger = new LoggerConfiguration().MinimumLevel.Information().MinimumLevel.Override("Microsoft", LogEventLevel.Warning).MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}").CreateLogger();

try
{
    Log.Information("RentNest Messaging API Starting.........");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // setting up Database 
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions => sqlOptions.MigrationsAssembly("RentNest.MessagingAPI")
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

    });


    builder.Services.AddControllers();

    builder.Services.AddOpenApi();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("RentNestMessagingCors", policy =>
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials());
    });

  
    builder.Services.AddScoped<MessageService>();


    var app = builder.Build();


    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }


    app.UseHttpsRedirection();

 
    app.UseExceptionHandler("/error");


    app.UseCors("RentNestMessagingCors");


    app.UseAuthentication();
    app.UseAuthorization();

    // Simple error endpoint
    app.Map("/error", (HttpContext context) =>
    {
        return Results.Problem(
            title: "Something went wrong.",
            statusCode: 500);
    });

 
    app.MapControllers();


    app.Lifetime.ApplicationStarted.Register(() =>
    {
        Log.Information($"RentNest Messaging Server is runing successfully in {builder.Environment.EnvironmentName} mode and listening!!");

        foreach (var url in app.Urls)
        {
            Log.Information("Listening on: {Url}", url);
        }
    });

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Messaging API failed to start!");
}
finally
{
    Log.CloseAndFlush();
}