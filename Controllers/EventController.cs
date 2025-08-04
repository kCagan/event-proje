using Microsoft.AspNetCore.Mvc;
using EventProje.Data;
using EventProje.Models;
using Microsoft.EntityFrameworkCore;

namespace EventProje.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventController(ApplicationDbContext context)
        {
            _context = context;
        }

        

        [HttpGet]
        public IActionResult GetEvents()
        {
            var events = _context.Events.Include(e => e.User).ToList();
            return Ok(events);
        }

        [HttpPost]
        public IActionResult Create(Event ev)
        {
            _context.Events.Add(ev);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = ev.EventId }, ev);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Event updated)
        {
            var ev = _context.Events.Find(id);
            if (ev == null) return NotFound();

            ev.Title = updated.Title;
            ev.StartDate = updated.StartDate;
            ev.EndDate = updated.EndDate;
            ev.ShortDescription = updated.ShortDescription;
            ev.LongDescription = updated.LongDescription;
            ev.ImagePath = updated.ImagePath;
            ev.IsActive = updated.IsActive;
            ev.CreatedBy = updated.CreatedBy;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var ev = _context.Events.Find(id);
            if (ev == null) return NotFound();

            _context.Events.Remove(ev);
            _context.SaveChanges();
            return NoContent();
        }
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var eventItem = _context.Events.Include(e => e.User).FirstOrDefault(e => e.EventId == id);
            if (eventItem == null)
                return NotFound();

            return Ok(eventItem);
        }
    }
}
