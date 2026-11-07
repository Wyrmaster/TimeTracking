using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Postgresql;
using TimeTracking.Persistence.SqLite;
using TimeTracking.Service.Common;

namespace TimeTracking.Service.Extensions;

/// <summary>
///   Registers the database context of the configured database provider
/// </summary>
public static class PersistenceServiceCollectionExtension
{
  #region Constants

  private const string
    DataSourceKey = "DataSource",
    PostgresqlConnectionStringName = "TimeTrackingPostgresql",
    SqliteConnectionStringName = "TimeTrackingSqlite",
    MigrationsHistoryTable = "__migrations_history",
    Schema = "tt";

  #endregion

  #region Extension Methods

  /// <summary>
  ///   Registers the pooled <see cref="Context"/> for the database provider selected by the <c>DataSource</c>
  ///   configuration
  /// </summary>
  /// <param name="services">service collection to register the context in</param>
  /// <param name="configuration">configuration containing the data source and the connection strings</param>
  /// <param name="isDevelopment">whether detailed and sensitive data may be logged</param>
  /// <returns></returns>
  /// <exception cref="ArgumentException">the data source or its connection string is not configured</exception>
  public static IServiceCollection AddPersistence
  (
    this IServiceCollection services,
    IConfiguration configuration,
    bool isDevelopment
  )
  {
    DataSourceType dataSourceType = configuration.GetValue<DataSourceType>(DataSourceKey);

    switch (dataSourceType)
    {
      case DataSourceType.Postgres:
      {
        string connectionString = PersistenceServiceCollectionExtension.GetConnectionString
        (
          configuration,
          PostgresqlConnectionStringName
        );

        services.AddDbContextPool<Context, PostgresqlContext>(options => PersistenceServiceCollectionExtension
          .Configure(options, isDevelopment)
          .UseNpgsql
          (
            connectionString,
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable(MigrationsHistoryTable, Schema)
          ));
        break;
      }
      case DataSourceType.Sqlite:
      {
        string connectionString = PersistenceServiceCollectionExtension.GetConnectionString
        (
          configuration,
          SqliteConnectionStringName
        );

        services.AddDbContextPool<Context, SqLiteContext>(options => PersistenceServiceCollectionExtension
          .Configure(options, isDevelopment)
          .UseSqlite(connectionString));
        break;
      }
      default:
        throw new ArgumentException($"Invalid data source type {dataSourceType}");
    }

    return services;
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   Applies the options shared by every database provider
  /// </summary>
  /// <param name="options">options of the context</param>
  /// <param name="isDevelopment">whether detailed and sensitive data may be logged</param>
  /// <returns></returns>
  private static DbContextOptionsBuilder Configure(DbContextOptionsBuilder options, bool isDevelopment)
  {
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

    if (isDevelopment)
    {
      options
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors();
    }

    return options;
  }

  /// <summary>
  ///   Resolves a connection string that has to be configured
  /// </summary>
  /// <param name="configuration">configuration containing the connection strings</param>
  /// <param name="name">name of the connection string</param>
  /// <returns></returns>
  /// <exception cref="ArgumentException">the connection string is not configured</exception>
  private static string GetConnectionString(IConfiguration configuration, string name)
    => configuration.GetConnectionString(name)
       ?? throw new ArgumentException($"Missing connection string {name}");

  #endregion
}
