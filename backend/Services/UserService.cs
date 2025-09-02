using EventProje.Models;
using EventProje.Repositories.Interfaces;
using EventProje.Services.Interfaces;

namespace EventProje.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        public Task<List<User>> GetAllAsync() => _repository.GetAllAsync();
        public Task<User?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<User?> GetByEmailAsync(string email) => _repository.GetByEmailAsync(email);
        public Task<User> CreateAsync(User user) => _repository.AddAsync(user);
        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _repository.EmailExistsAsync(email);
        }

        public Task UpdateAsync(User user) => _repository.UpdateAsync(user);
        public Task DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}
