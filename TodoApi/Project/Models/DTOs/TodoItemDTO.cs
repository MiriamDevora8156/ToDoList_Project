using System.ComponentModel.DataAnnotations;
using TodoApi.Project.Models.Entities; // הוספת ה-using הזה

namespace TodoApi.Project.Models.DTOs;

public class TodoItemDTO
{
    public int Id { get; set; }

    [Required(ErrorMessage = "שם המשימה הוא שדה חובה")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    public bool IsComplete { get; set; }

    // שינוי מ-int ל-TaskPriority
    public TaskPriority? Priority { get; set; } 

    public DateTime? DueDate { get; set; }
    public string? CategoryName { get; set; }
}