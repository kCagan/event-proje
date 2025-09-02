using EventProje.Data;
using EventProje.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EventProje.Repositories;
using EventProje.Repositories.Interfaces;
using EventProje.Services.Interfaces;


var builder = WebApplication.CreateBuilder(args);

// 🔐 JWT ayarlarını appsettings.json'dan al
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Jwt:Key is missing in appsettings.json");
    
var allowed = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", p =>
        p.WithOrigins(allowed)
         .AllowAnyHeader()
         .AllowAnyMethod());
});
    
// 📦 EF Core için DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 📦 Service ve Controller ayarları
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<EncryptionService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventService, EventService>();





// 🔐 JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy
            .WithOrigins(
                "http://localhost:5173", // Vite
                "http://localhost:3000"  // CRA
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            // Eğer ileride cookie/SignalR vs. kullanacaksan açarsın:
            //.AllowCredentials()
    );
});

var app = builder.Build();

// Geliştirme ortamı için Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ⬇️ wwwroot içinden /uploads dosyalarını servis et
app.UseStaticFiles(); // wwwroot varsayılanı

// SIRALAMA önemli: CORS'u auth'dan ÖNCE çağır
app.UseCors("frontend");

// 🔐 Middleware sırası önemli
app.UseAuthentication();
app.UseAuthorization();

// Controller'ları aktif et
app.MapControllers();

app.Run();
