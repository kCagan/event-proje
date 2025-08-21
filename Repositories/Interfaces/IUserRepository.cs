using EventProje.Models;

namespace EventProje.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User> AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(int id);
        Task<bool> EmailExistsAsync(string email);

        Task<User?> GetByEmailAsync(string email);
    }
}
