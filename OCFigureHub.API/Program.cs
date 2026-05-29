using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OCFigureHub.API.BackgroundJobs;
using OCFigureHub.API.Middlewares;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.Abstractions.AI;
using OCFigureHub.Application.Abstractions.Jobs;
using OCFigureHub.Application.Abstractions.Payments;
using OCFigureHub.Application.Services;
using OCFigureHub.Infrastructure.AI;
using OCFigureHub.Infrastructure.Payments;
using OCFigureHub.Infrastructure.Persistence;
using OCFigureHub.Infrastructure.Repositories;
using OCFigureHub.Infrastructure.Security;
using OCFigureHub.Infrastructure.Services;
using OCFigureHub.Infrastructure.Storage;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

#region Controllers + Swagger

builder.Services.AddControllers();

// Increase file upload limit for FormOptions
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524288000; // 500 MB
});

// Increase file upload limit for Kestrel
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 524288000; // 500 MB
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OC Figure Hub API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

#endregion

#region CORS

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://ocfigurehub.vercel.app"  // production URL
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

#endregion

#region Rate Limiting

builder.Services.AddRateLimiter(options =>
{
    // Global default: 100 requests per minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Stricter limit for auth endpoints (login, register, forgot-password)
    options.AddFixedWindowLimiter("AuthLimiter", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

#endregion

#region DbContext

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

#endregion

#region Repositories

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductFileRepository, ProductFileRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
builder.Services.AddScoped<IQuotaRepository, QuotaRepository>();
builder.Services.AddScoped<IDownloadRepository, DownloadRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<ISavedItemRepository, SavedItemRepository>();

#endregion

#region Services

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AdminProductService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<SubscriptionService>();
builder.Services.AddScoped<DownloadService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<ISavedItemService, SavedItemService>();
builder.Services.AddScoped<UserProfileService>();
builder.Services.AddScoped<QuotaResetJob>();
builder.Services.AddScoped<IAntiLeakService, OCFigureHub.Infrastructure.Repositories.AntiLeakService>();

#endregion

#region Chat Services

builder.Services.AddSingleton<IChatRateLimiter, InMemoryChatRateLimiter>();

builder.Services.AddHttpClient<GeminiFreeChatProvider>();
builder.Services.AddHttpClient<GeminiCheapChatProvider>();

builder.Services.AddScoped<GeminiFreeChatProvider>(sp =>
{
    var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
    var httpClient = httpClientFactory.CreateClient(nameof(GeminiFreeChatProvider));
    var logger = sp.GetRequiredService<ILogger<GeminiFreeChatProvider>>();
    var apiKey = builder.Configuration["GeminiFree:ApiKey"] ?? "";
    return new GeminiFreeChatProvider(httpClient, logger, apiKey);
});

builder.Services.AddScoped<GeminiCheapChatProvider>(sp =>
{
    var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
    var httpClient = httpClientFactory.CreateClient(nameof(GeminiCheapChatProvider));
    var logger = sp.GetRequiredService<ILogger<GeminiCheapChatProvider>>();
    var apiKey = builder.Configuration["GeminiCheap:ApiKey"] ?? "";
    return new GeminiCheapChatProvider(httpClient, logger, apiKey);
});

builder.Services.AddScoped<RuleBasedChatProvider>();

builder.Services.AddScoped<IChatRepository, ChatRepository>();

builder.Services.AddScoped<IEnumerable<IAiChatProvider>>(sp =>
{
    var providers = new List<IAiChatProvider>
    {
        sp.GetRequiredService<GeminiFreeChatProvider>(),
        sp.GetRequiredService<GeminiCheapChatProvider>(),
        sp.GetRequiredService<RuleBasedChatProvider>()
    };
    return providers;
});

builder.Services.AddScoped<AiChatRouterService>();

#endregion

#region Security

builder.Services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

#endregion

#region Storage (Azure Blob)

builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();
builder.Services.AddScoped<IModelOptimizer, DracoModelOptimizer>();

#endregion

#region PayOS

builder.Services.Configure<PayOSOptions>(
    builder.Configuration.GetSection("PayOS"));

builder.Services.AddHttpClient<PayOSGateway>();
builder.Services.AddScoped<IPaymentGateway, PayOSGateway>();

#endregion

#region Background Jobs

builder.Services.AddHostedService<MonthlyQuotaResetHostedService>();
builder.Services.AddHostedService<SubscriptionExpiryHostedService>();

#endregion

#region JWT Auth

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

#endregion

var app = builder.Build();

#region Seed Data (demo)

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    Console.WriteLine("Applying migrations and seeding database...");
    db.Database.Migrate();
    DbInitializer.Seed(db);
    Console.WriteLine("Database initialization complete.");
}

#endregion

#region Middleware

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

#endregion

app.Run();
