using AutoMapper;
using FinalProject;
using FinalProject.BLL;
using FinalProject.BLL.Interfaces;
using FinalProject.DAL;
using FinalProject.DAL.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Text.Json.Serialization;
using FinalProject.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<IDonorService, DonorService>();
builder.Services.AddScoped<IGiftService, GiftService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ILotteryService, LotteryService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDonorDAL, DonorDAL>();
builder.Services.AddScoped<IGiftDAL, GiftDAL>();
builder.Services.AddScoped<ITicketDAL, TicketDAL>();
builder.Services.AddScoped<IAuthDAL, AuthDAL>();
builder.Services.AddScoped<ICategoryDAL, CategoryDAL>();
builder.Services.AddScoped<ILotteryDAL, LotteryDAL>();

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

IServiceCollection serviceCollection = builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddSingleton<IMapper>(
    new Mapper(new MapperConfiguration(cfg => cfg.AddProfile<ChineseSaleProfile>())));

builder.Services.AddDbContext<CheineseSaleContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    );

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => 
    { 
        options.TokenValidationParameters = new TokenValidationParameters
            { 
                ValidateIssuer = true,
                ValidateAudience = true, 
                ValidateLifetime = true, 
                ValidateIssuerSigningKey = true, 
                ValidIssuer = builder.Configuration["Jwt:Issuer"], 
                ValidAudience = builder.Configuration["Jwt:Audience"], 
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                RoleClaimType = "role"

        }; 
    });

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // ensure unique schema ids so DTOs with same class name in different namespaces don't collide
    c.CustomSchemaIds(type => type.FullName);

    // ...existing swagger configuration...
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200") 
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;
    });

System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowFrontend");

// Request logging middleware
app.UseRequestLogging();

app.MapControllers();

app.Run();