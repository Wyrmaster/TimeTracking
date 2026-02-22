using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TimeTracking.Persistence.SqLite;

public class DesignContextFactory: IDesignTimeDbContextFactory<SqLiteContext>
{
  #region DesignTimeDbContextFactory
  
  public SqLiteContext CreateDbContext(string[] args)
  {
    DbContextOptionsBuilder<SqLiteContext> builder = new();

    SqliteConnectionStringBuilder connectionStringBuilder = new()
    {
      DataSource = "./Test.db"
    };
    
    builder.UseSqlite(connectionStringBuilder.ToString());

    return new(builder.Options);
  }

  #endregion
}