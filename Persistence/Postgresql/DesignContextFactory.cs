using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace TimeTracking.Persistence.Postgresql;

public class DesignContextFactory: IDesignTimeDbContextFactory<PostgresqlContext>
{
  #region DesignTimeDbContextFactory
  
  public PostgresqlContext CreateDbContext(string[] args)
  {
    DbContextOptionsBuilder<PostgresqlContext> builder = new();

    NpgsqlConnectionStringBuilder connectionStringBuilder = new()
    {
      Host = "localhost",
      Database = "TimeTracking",
      Port = 46005,
      Username = "postgres",
      Password = "postgres",
    };
    
    builder.UseNpgsql(connectionStringBuilder.ToString());

    return new(builder.Options);
  }

  #endregion
}