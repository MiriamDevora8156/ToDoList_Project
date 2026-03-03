using Microsoft.EntityFrameworkCore;
using TodoApi.Project.Data;       // השורה הקריטית לפתרון השגיאה
using TodoApi.Project.Interfaces;
using TodoApi.Project.Models;

namespace TodoApi.Project.Services;

public class CategoryService : ICategoryService
{
    private readonly ToDoDbContext _context;

    public CategoryService(ToDoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<object>> GetAllAsync()
    {
        return await _context.Categories
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();
    }

    public async Task AddAsync(string name)
    {
        if (await _context.Categories.AnyAsync(c => c.Name == name)) 
        return;
        
        _context.Categories.Add(new Category { Name = name });
        await _context.SaveChangesAsync();
    }
}