using EventProje.Models;
using EventProje.Repositories.Interfaces;
using EventProje.Services.Interfaces;
using System.Linq;

namespace EventProje.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _repository;

        public EventService(IEventRepository repository)
        {
            _repository = repository;
        }

        public Task<List<Event>> GetAllAsync() => _repository.GetAllAsync();
        public Task<Event?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<Event> CreateAsync(Event evt) => _repository.AddAsync(evt);
        public Task UpdateAsync(Event evt) => _repository.UpdateAsync(evt);
        public Task DeleteAsync(int id) => _repository.DeleteAsync(id);

        public async Task<bool> TitleExistsAsync(string title)
        {
            var existing = await _repository.GetAllAsync();
            return existing.Any(e => e.Title == title);
        }

        // İstersen controller burayı kullansın diye bırakıyoruz (nullable yok, '??' YOK)
        public async Task<List<Event>> GetPublicAsync(DateTime nowUtc)
        {
            var all = await _repository.GetAllAsync();

            return all
                .Where(e => e.IsActive == true && (e.EndDate >= nowUtc || e.StartDate >= nowUtc))
                .OrderBy(e => e.StartDate)
                .ToList();
        }
    }
}
