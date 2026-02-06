using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OCFigureHub.API.BackgroundJobs;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.Abstractions.Payments;
using OCFigureHub.Application.Services;
using OCFigureHub.Infrastructure.Payments;
using OCFigureHub.Infrastructure.Persistence;
using OCFigureHub.Infrastructure.Repositories;
using OCFigureHub.Infrastructure.Security;
using OCFigureHub.Infrastructure.Storage;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

#region Controllers + Swagger

builder.Services.AddControllers();
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
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
builder.Services.AddScoped<IQuotaRepository, QuotaRepository>();
builder.Services.AddScoped<IDownloadRepository, DownloadRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

#endregion

#region Services

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AdminProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<SubscriptionService>();
builder.Services.AddScoped<DownloadService>();
builder.Services.AddScoped<ReportService>();

#endregion

#region Security

builder.Services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

#endregion

#region Storage (Azure Blob)

builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();

#endregion

#region VNPay

builder.Services.Configure<VNPayOptions>(
    builder.Configuration.GetSection("VNPay"));

builder.Services.AddScoped<IPaymentGateway, VNPayGateway>();

#endregion

#region Background Jobs

builder.Services.AddHostedService<MonthlyQuotaResetHostedService>();

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

#region Middleware

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

#endregion

app.Run();
