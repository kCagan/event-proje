using EventProje.Models;

namespace EventProje.Services.Interfaces
{
    public interface IEventService
    {
        Task<List<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(int id);
        Task<Event> CreateAsync(Event evt);
        Task UpdateAsync(Event evt);
        Task DeleteAsync(int id);
        Task<bool> TitleExistsAsync(string title);
        
        Task<List<Event>> GetPublicAsync(DateTime nowUtc);
    }
}
