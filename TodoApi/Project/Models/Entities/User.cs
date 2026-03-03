using System;
using System.Collections.Generic;

namespace TodoApi.Project.Data;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public virtual ICollection<Todolist> Todolists { get; set; } = new List<Todolist>();
}
