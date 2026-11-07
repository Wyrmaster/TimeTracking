using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Configurations;
using TimeTracking.Service.Endpoints;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.GraphQL;
using TimeTracking.Service.GraphQL.Mutations;
using TimeTracking.Service.GraphQL.Types;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;

const string
  graphQlPath = "/graphql/v1",
  graphiQlPath = "/graphql/v1/nitro",
  tokenConfigurationKey = "Token";

// load the secrets from the .env file in the repository root (or any parent of the working directory) into the
// environment variables, variables that are already set (e.g. by docker compose) win over the file
Env
  .TraversePath()
  .NoClobber()
  .Load();

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

// read the symmetric key from the configuration: an environment variable or the .env file, see .env.example
string? tokenSecret = builder.Configuration[tokenConfiguration.SecretVariableName];

if (string.IsNullOrEmpty(tokenSecret))
{
  throw new ArgumentException
  (
    $"Missing token secret {tokenConfiguration.SecretVariableName}, "
    + "set it as environment variable or in the .env file, see .env.example"
  );
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

builder.Services.AddEndpointsApiExplorer();
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
builder.Services.AddPersistence(builder.Configuration, builder.Environment.IsDevelopment());

builder.Services.Configure<TokenConfiguration>(builder.Configuration.GetSection(tokenConfigurationKey));


builder.Services.AddMvc();

builder.Services.AddScoped<ITimeTrackingService, TimeTrackingService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddSingleton<IDiceChargeStore, DiceChargeStore>();
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
builder.Services.AddSingleton(new TokenSecretConfiguration(tokenSecret));

builder.Services
  .AddGraphQLServer()
  .AddAuthorization()
    .AddQueryType<TimeTrackingQuery>()
    .AddMutationType<TimeTrackingMutation>()
    .AddType<UserType>()
  .AddProjections()
  .AddFiltering()
  .AddSorting()
  .AddPagingArguments()
  // show the actual exception instead of "Unexpected Execution Error" while developing
  .ModifyRequestOptions(options => options.IncludeExceptionDetails = builder.Environment.IsDevelopment())
;

builder.Services.AddAuthorization();

// setup logging
builder.Logging.AddSerilog
(
  new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .Enrich.FromLogContext()
    .CreateLogger()
);

WebApplication app = builder.Build();

// bring the database schema up to date before serving requests
using (IServiceScope scope = app.Services.CreateScope())
{
  await scope
    .ServiceProvider
    .GetRequiredService<Context>()
    .Database
    .MigrateAsync();
}

app.UseDefaultFiles(); // Looks for index.html
app.UseStaticFiles();  // Serves files from wwwroot

app.MapFallbackToFile("index.html");

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI(options =>
  {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = "swagger";

  });
}

app
  .MapActivityEndpoints()
  .MapDiceEndpoints()
  .MapTimeTrackingEndpoints()
  .MapWorkspaceEndpoints()
  .MapAuthenticationEndpoints()
  .MapStatisticsEndpoints()
;

app.MapGraphQL(graphQlPath);
app.MapNitroApp(graphiQlPath);

// the address is configured by ASPNETCORE_URLS (see the Dockerfile) or the launch profile during development
await app.RunAsync();