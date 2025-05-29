using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Postgresql;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

string connectionString = builder.Configuration.GetConnectionString("TimeTracking")!;

builder.Services.AddMvc();

builder.Services.AddDbContextPool<Context, PostgresqlContext>
(
  optionsBuilder => optionsBuilder
    .UseNpgsql
    (
      connectionString,
      contextOptionsBuilder => contextOptionsBuilder.MigrationsHistoryTable("__migrations_history", "tt")
    )
    .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
    .EnableSensitiveDataLogging()
    .EnableDetailedErrors()
);

builder.Services.AddSingleton<ITimeTrackingData, TimeTrackingData>();

WebApplication app = builder.Build();

app.MapControllers();

app.Run();