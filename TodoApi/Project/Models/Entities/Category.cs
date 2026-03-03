using System;
using System.Collections.Generic;

namespace TodoApi.Project.Data;

public partial class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Todolist> Todolists { get; set; } = new List<Todolist>();
}
