using Microsoft.EntityFrameworkCore;
using TodoApi.Project.Interfaces;
using TodoApi.Project.Models.DTOs;
using TodoApi.Project.Models.Entities;
using TodoApi.Project.Data;
using System.Security.Claims;
using Serilog;

namespace TodoApi.Project.Services;

public class TodoService : ITodoService
{
    private readonly ToDoDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TodoService(ToDoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    // פונקציית עזר פרטית לחילוץ ה-ID מהטוקן באופן מאובטח
    private int GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return 0;
        return int.Parse(userIdClaim.Value);
    }

    public async Task<IEnumerable<TodoItemDTO>> GetAllAsync(string? search = null, bool? isComplete = null)
    {
        var currentUserId = GetCurrentUserId();
        var query = _context.Todolists.Where(t => t.UserId == currentUserId); // רק מה שלא נמחק

        // סינון לפי חיפוש בשם
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(t => t.Name != null && t.Name.Contains(search));
        }

        // סינון לפי סטטוס ביצוע
        if (isComplete.HasValue)
        {
            query = query.Where(t => t.IsComplete == isComplete.Value);
        }

        return await query
        .AsNoTracking()
        .OrderBy(t => t.DueDate) // הדחופות ביותר יופיעו ראשונות
        .ThenByDescending(t => t.Priority) // ואז לפי עדיפות גבוהה
            .Select(t => new TodoItemDTO
            {
                Id = t.Id,
                Name = t.Name ?? "",
                IsComplete = t.IsComplete ?? false,
                Priority = (TaskPriority?)t.Priority,
                DueDate = t.DueDate,
                CategoryName = t.Category != null ? t.Category.Name : "כללי"
            }).ToListAsync();
    }

    public async Task<TodoItemDTO?> GetByIdAsync(int id, int userId)
    {
        var currentUserId = GetCurrentUserId();
        var task = await _context.Todolists
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == currentUserId);

        if (task == null) return null;

        return new TodoItemDTO
        {
            Id = task.Id,
            Name = task.Name ?? "",
            IsComplete = task.IsComplete ?? false,
            Priority = (TaskPriority?)task.Priority,
            CategoryName = task.Category?.Name
        };
    }

    // בתוך TodoService.cs -> AddAsync
    public async Task AddAsync(TodoItemDTO itemDto)
    {
        var userId = GetCurrentUserId();

        // 1. נקה רווחים מיותרים מהשם שהגיע מה-React
        string categoryNameToSearch = itemDto.CategoryName?.Trim() ?? "כללי";

        // 2. חפש את הקטגוריה ב-DB (בלי קשר לאותיות גדולות/קטנות)
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Name.ToLower() == categoryNameToSearch.ToLower());

        // 3. אם הקטגוריה לא קיימת בטבלה - ניצור אותה עכשיו!
        if (category == null)
        {
            category = new Category { Name = categoryNameToSearch };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync(); // שמירה כדי לייצר ID חדש
        }

        // 4. עכשיו כשיש לנו ID בטוח, ניצור את המשימה
        var newItem = new Todolist
        {
            Name = itemDto.Name,
            IsComplete = false,
            Priority = (int?)itemDto.Priority ?? (int)TaskPriority.Low,
            UserId = userId,
            CategoryId = category.Id, // עכשיו זה בטוח מקושר לקטגוריה הנכונה
            DueDate = itemDto.DueDate,
        };

        _context.Todolists.Add(newItem);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TodoItemDTO itemDto, int userId)
    {
        var currentUserId = GetCurrentUserId();
        var existingTask = await _context.Todolists
            .FirstOrDefaultAsync(t => t.Id == itemDto.Id && t.UserId == currentUserId);

        if (existingTask != null)
        {
            // עדכון השם רק אם הגיע שם חדש ולא ריק מה-Client
            if (!string.IsNullOrWhiteSpace(itemDto.Name))
            {
                existingTask.Name = itemDto.Name;
            }

            existingTask.IsComplete = itemDto.IsComplete;
            existingTask.Priority = (int?)itemDto.Priority;

            await _context.SaveChangesAsync();
        }
    }
    public async Task DeleteAsync(int id, int userId)
    {
        var currentUserId = GetCurrentUserId();
        var task = await _context.Todolists
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == currentUserId);

        if (task != null)
        {
            _context.Todolists.Remove(task);
            await _context.SaveChangesAsync();
            Log.Information($"User {currentUserId} permanently deleted task {id}");
        }
    }

    public async Task<object> GetStatisticsAsync()
    {
        var userId = GetCurrentUserId();
        var allTasks = await _context.Todolists.Where(t => t.UserId == userId).ToListAsync();

        return new
        {
            TotalTasks = allTasks.Count,
            CompletedTasks = allTasks.Count(t => t.IsComplete == true),
            PendingTasks = allTasks.Count(t => t.IsComplete != true),
            HighPriorityTasks = allTasks.Count(t => t.Priority == (int)TaskPriority.High),
            UpcomingTasks = allTasks.Count(t => t.DueDate > DateTime.Now && t.IsComplete != true)
        };
    }
}