using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApi.Project.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net; 

namespace TodoApi.Project.Services;

public class AuthService
{
    private readonly ToDoDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(ToDoDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task RegisterAsync(string username, string password)
    {
        // יצירת סיסמה מוצפנת (Hash)
        string securePassword = BCrypt.Net.BCrypt.HashPassword(password);
        
        _context.Users.Add(new User { 
            Username = username, 
            PasswordHash = securePassword 
        });
        await _context.SaveChangesAsync();
    }

    public async Task<string?> LoginAsync(string username, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        
        // בדיקה: האם המשתמש קיים והאם הסיסמה שהזין מתאימה ל-Hash השמור
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        return GenerateToken(user);
    }

    private string GenerateToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourVeryLongSecretKeyHere123456!"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var token = new JwtSecurityToken("TodoApi", "TodoApiUsers", claims,
            expires: DateTime.Now.AddDays(1), signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}