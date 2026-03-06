using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;
using TodoApi.Project.Data; // ודאי שזה תואם ל-Namespace בתוך ה-DbContext
using TodoApi.Project.Interfaces;
using TodoApi.Project.Services;
using TodoApi.Project.Models.DTOs;
using Microsoft.OpenApi.Models;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();


var builder = WebApplication.CreateBuilder(args);

// --- 1. הזרקת שירותים (DI) ---

var connectionString = builder.Configuration.GetConnectionString("ToDoDB");

builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Host.UseSerilog();

// רישום השירותים שלך
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// הגדרת JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "TodoApi",
            ValidAudience = "TodoApiUsers",
            // כאן הקוד מושך את הסוד ממשתני הסביבה שהגדרנו ב-Render
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT_SECRET_KEY"] ?? "FallbackKeyForLocalDevelopment123456!"))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // הגדרה שמאפשרת להכניס את ה-Token ישירות בתוך Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "הכניסי את הטוקן בלבד (ללא המילה Bearer)"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   // מאפשר גישה מכל כתובת (כולל localhost:3000)
              .AllowAnyMethod()   // מאפשר את כל הפעולות (GET, POST, PUT, DELETE)
              .AllowAnyHeader();  // מאפשר את כל ה-Headers
    });
});

// --- 2. Middleware Pipeline ---
var app = builder.Build();

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = "Internal Server Error",
            message = "חלה שגיאה פנימית בשרת. אנא נסה שוב מאוחר יותר."
        };

        await context.Response.WriteAsJsonAsync(response);
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll"); // הפעלת המדיניות שהגדרנו למעלה

app.Use(async (context, next) =>
{
    await next();
    if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = "הנתיב המבוקש לא נמצא" });
    }
});
// --- 3. Routes ---

// שליפת כל המשימות
app.MapGet("/items", async (string? search, bool? isComplete, ITodoService todoService) =>
{
    var items = await todoService.GetAllAsync(search, isComplete);
    return Results.Ok(items);
}).RequireAuthorization();

// שליפת סטטיסטיקות (שיניתי את הנתיב כדי שלא יתנגש)
app.MapGet("/items/stats", async (ITodoService todoService) =>
{
    return Results.Ok(await todoService.GetStatisticsAsync());
}).RequireAuthorization();

// שליפת משימה בודדת לפי ID
app.MapGet("/items/{id}", async (int id, ITodoService todoService) =>
{
    var item = await todoService.GetByIdAsync(id, 0);
    return item is not null ? Results.Ok(item) : Results.NotFound();
}).RequireAuthorization();

// הוספת משימה חדשה
app.MapPost("/items", async (ITodoService service, TodoItemDTO item) =>
{
    await service.AddAsync(item);
    return Results.Created($"/items/{item.Id}", item);
});

// עדכון משימה
app.MapPut("/items/{id}", async (int id, TodoItemDTO itemDto, ITodoService todoService) =>
{
    itemDto.Id = id;
    await todoService.UpdateAsync(itemDto, 0);
    return Results.NoContent();
}).RequireAuthorization();

// מחיקת משימה
app.MapDelete("/items/{id}", async (int id, ITodoService todoService) =>
{
    await todoService.DeleteAsync(id, 0);
    return Results.NoContent();
}).RequireAuthorization();

// --- Auth Routes ---
app.MapPost("/register", async (AuthService auth, UserDTO user) =>
{
    await auth.RegisterAsync(user.Username, user.Password);
    return Results.Ok("User registered");
});

app.MapPost("/login", async (AuthService auth, UserDTO user) =>
{
    var token = await auth.LoginAsync(user.Username, user.Password);
    return token != null ? Results.Ok(new { token }) : Results.Unauthorized();
});

app.MapGet("/categories", async (ICategoryService service) => Results.Ok(await service.GetAllAsync()));
app.MapPost("/categories", async (string name, ICategoryService service) =>
{
    await service.AddAsync(name);
    return Results.Created();
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();