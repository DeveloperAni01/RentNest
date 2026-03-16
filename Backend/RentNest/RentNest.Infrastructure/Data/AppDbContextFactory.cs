using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RentNest.Infrastructure.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer(
                "Server=DESKTOP-ANIRBAN\\SQLEXPRESS;Database=RentNestDB;Trusted_Connection=True;TrustServerCertificate=True;",
                sql => sql.MigrationsAssembly("RentNest.Infrastructure")
            );

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}