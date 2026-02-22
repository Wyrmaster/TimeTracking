using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Postgresql;
using TimeTracking.Persistence.SqLite;
using TimeTracking.Service.Common;
using TimeTracking.Service.Configurations;
using TimeTracking.Service.GraphQL;
using TimeTracking.Service.GraphQL.Mutations;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;

const string
  graphQlPath = "/graphql/v1",
  graphiQlPath = "/graphql/v1/nitro",
  tokenConfigurationKey = "Token";

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// load the token configuration
TokenConfiguration? tokenConfiguration  = builder
  .Configuration
  .GetSection(tokenConfigurationKey)
  .Get<TokenConfiguration>();

if (tokenConfiguration == null)
{
  throw new ArgumentException($"Missing configuration for {nameof(TokenConfiguration)}");
}

// read the symmetric key from the environmentvariable 
string? tokenSecret = builder.Environment.IsDevelopment()
  ? "2f3fedd50944d446d7859a33a656cffe8783161725e127d5195ba88c41fc3ec1db4b0d4bcae14f0f4d76d209840e9c89d24b76b907236ba3355d395131df99fb"
  : builder.Configuration[tokenConfiguration.SecretVariableName];

if (string.IsNullOrEmpty(tokenSecret))
{
  throw new ArgumentException($"Missing environment variable {tokenConfiguration.SecretVariableName}");
}

builder
  .Services
  .AddAuthentication(options =>
  {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
  })
  .AddJwtBearer(options =>
  {
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidIssuer = tokenConfiguration.Issuer,
      ValidAudience = tokenConfiguration.Audience,
      IssuerSigningKey =  new SymmetricSecurityKey(Encoding.ASCII.GetBytes(tokenSecret)),
      ValidateIssuer = true,
      ValidateAudience = true,
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true
    };
  });

builder.Services.AddSwaggerGen(c =>
{
  c.SwaggerDoc("v1", new OpenApiInfo{ Title = "TimeTracking", Version = "v1" });
  c.UseInlineDefinitionsForEnums();
  c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
  c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
  {
    Name = "Authorization",
    Type = SecuritySchemeType.Http,
    Scheme = "Bearer",
    BearerFormat = "JWT",
    In =ParameterLocation.Header,
    Description = "Enter 'Bearer {token}'",
  });
  c.AddSecurityRequirement(openApiDocument => 
    new OpenApiSecurityRequirement
    {
      {
        new OpenApiSecuritySchemeReference("Bearer", openApiDocument), []
      }
    });
});

// setup databases
DataSourceType dataSourceType = builder.Configuration.GetValue<DataSourceType>("DataSource");

switch (dataSourceType)
{
  case DataSourceType.Postgres:
  {
    string connectionString = builder.Configuration.GetConnectionString("TimeTrackingPostgresql")!;
    builder.Services.AddDbContextPool<Context, PostgresqlContext>(optionsBuilder =>
      optionsBuilder
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors()
        .UseNpgsql
        (
          connectionString,
          contextOptionsBuilder => contextOptionsBuilder.MigrationsHistoryTable("__migrations_history", "tt")
        )
    );
    new PostgresqlContext(new DbContextOptionsBuilder()
      .UseNpgsql
      (
        connectionString,
        contextOptionsBuilder => contextOptionsBuilder.MigrationsHistoryTable("__migrations_history", "tt")
      ).Options)
      .Database.Migrate();
    break;
  }
  case DataSourceType.Sqlite:
  {
    string connectionString = builder.Configuration.GetConnectionString("TimeTrackingSqlite")!;
    builder.Services.AddDbContextPool<Context, SqLiteContext>(optionsBuilder =>
      optionsBuilder
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors()
        .UseSqlite(connectionString));
    
    new SqLiteContext(new DbContextOptionsBuilder()
      .UseSqlite(connectionString).Options)
      .Database.Migrate();
    break;
  }
  default:
    throw new ArgumentException($"Invalid data source type {dataSourceType}");
}

builder.Services.Configure<TokenConfiguration>(builder.Configuration.GetSection(tokenConfigurationKey));


builder.Services.AddMvc();

builder.Services.AddScoped<ITimeTrackingService, TimeTrackingService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationServiceService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddSingleton(new TokenSecretConfiguration(tokenSecret));

builder.Services
  .AddGraphQLServer()
  .AddAuthorizationCore()
    .AddQueryType<TimeTrackingQuery>()
    .AddMutationType<TimeTrackingMutation>()
  .AddFiltering()
  .AddSorting()
  .AddPagingArguments()
;

builder.Services.AddAuthorization();

// setup logging
builder.Logging.AddSerilog
(
  new LoggerConfiguration()
    .MinimumLevel.Verbose().WriteTo.Console()
    .CreateLogger()
);

WebApplication app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGraphQL(graphQlPath);
app.MapNitroApp(graphiQlPath);

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();

  app.UseSwaggerUI(options =>
  {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = "swagger";

  });
}if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();

  app.UseSwaggerUI(options =>
  {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = "swagger";
  });
  
  app.UseGraphQLGraphiQL(graphiQlPath);
}

app.Run();