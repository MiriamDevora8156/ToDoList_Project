public interface ICategoryService {
    Task<IEnumerable<object>> GetAllAsync();
    Task AddAsync(string name);
}