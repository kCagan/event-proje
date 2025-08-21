using EventProje.Models;

namespace EventProje.Repositories.Interfaces
{
    public interface IEventRepository
    {
        Task<List<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(int id);
        Task<Event> AddAsync(Event evt);
        Task UpdateAsync(Event evt);
        Task DeleteAsync(int id);
    }
}
