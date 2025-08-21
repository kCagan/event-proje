using EventProje.Data;
using EventProje.Models;
using EventProje.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EventProje.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext _context;

        public EventRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Event>> GetAllAsync() => await _context.Events.ToListAsync();
        public async Task<Event?> GetByIdAsync(int id) => await _context.Events.FindAsync(id);
        public async Task<Event> AddAsync(Event evt)
        {
            _context.Events.Add(evt);
            await _context.SaveChangesAsync();
            return evt;
        }

        public async Task UpdateAsync(Event evt)
        {
            _context.Events.Update(evt);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt != null)
            {
                _context.Events.Remove(evt);
                await _context.SaveChangesAsync();
            }
        }
    }
}
