using System;
using System.Collections.Generic;

namespace TodoApi.Project.Data;

public partial class Todolist
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public bool? IsComplete { get; set; }

    public int UserId { get; set; }

    public int? CategoryId { get; set; }

    public DateTime? DueDate { get; set; }

    public int? Priority { get; set; }

    public virtual Category? Category { get; set; }

    public virtual User User { get; set; } = null!;
}
