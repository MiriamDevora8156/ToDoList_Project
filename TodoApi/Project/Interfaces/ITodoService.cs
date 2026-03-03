using TodoApi.Project.Models.DTOs;

namespace TodoApi.Project.Interfaces;

public interface ITodoService
{
    Task<IEnumerable<TodoItemDTO>> GetAllAsync(string? search = null, bool? isComplete = null);
    Task<TodoItemDTO?> GetByIdAsync(int id, int userId);
    Task AddAsync(TodoItemDTO item);
    Task UpdateAsync(TodoItemDTO item, int userId);
    Task DeleteAsync(int id, int userId);
    Task<object> GetStatisticsAsync();
}