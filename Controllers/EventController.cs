using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EventProje.Models;
using EventProje.Services.Interfaces;
using EventProje.Dtos;
using System.Linq;
using System.Security.Claims;

namespace EventProje.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IUserService _userService; // CreatedBy bilgisi için
        private int? GetUserId()
        {
            var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : (int?)null;
        }

        public EventController(IEventService eventService, IUserService userService)
        {
            _eventService = eventService;
            _userService = userService;
        }

        // ---- Public (Kullanıcı Arayüzü) ----

        // Etkinlik Listesi (yalnız ileri tarihli + aktif)
        // ?take=5 -> ilk/erken başlayan 5 kaydı döndür (detay alt listesi için)
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic([FromQuery] int? take = null)
        {
            var now = DateTime.UtcNow;
            var events = await _eventService.GetAllAsync();

            // NOT: EndDate ve StartDate non-nullable olduğu için '??' KULLANMIYORUZ.
            IEnumerable<Event> query = events
                .Where(e => e.IsActive == true && (e.EndDate >= now || e.StartDate >= now))
                .OrderBy(e => e.StartDate); // tip: IOrderedEnumerable<Event>, ama değişkeni IEnumerable olarak tuttuk ki Take sonrası yeniden atama sorun olmasın

            if (take.HasValue && take.Value > 0)
                query = query.Take(take.Value);

            // CreatedByName için kullanıcı adlarını çekelim
            var users = await _userService.GetAllAsync();
            var userNameById = users.ToDictionary(u => u.UserId, u => u.NameSurname);

            var dtos = query.Select(e => new EventDto
            {
                EventId = e.EventId,
                Title = e.Title,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                ShortDescription = e.ShortDescription,
                IsActive = e.IsActive,
                CreatedByName = userNameById.TryGetValue(e.CreatedBy, out var name) ? name : null
            }).ToList();

            return Ok(dtos);
        }

        // Etkinlik Detay (public)
        [HttpGet("{id:int}/public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicById(int id)
        {
            var ev = await _eventService.GetByIdAsync(id);
            if (ev == null || ev.IsActive == false) return NotFound();

            // CreatedBy üzerinden kullanıcıyı getir
            var creator = await _userService.GetByIdAsync(ev.CreatedBy);

            var dto = new EventDetailDto
            {
                EventId = ev.EventId,
                Title = ev.Title,
                StartDate = ev.StartDate,
                EndDate = ev.EndDate,
                ShortDescription = ev.ShortDescription,
                LongDescription = ev.LongDescription,
                ImagePath = ev.ImagePath,
                IsActive = ev.IsActive,
                CreatedAt = ev.CreatedAt,
                CreatedByUser = creator == null ? null : new UserDto
                {
                    UserId = creator.UserId,
                    NameSurname = creator.NameSurname,
                    Email = creator.Email
                }
            };

            return Ok(dto);
        }

        // Takvim (public) – aktif + ileri tarihli
        [HttpGet("calendar")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCalendar()
        {
            var now = DateTime.UtcNow;
            var events = await _eventService.GetAllAsync();

            var items = events
                .Where(e => e.IsActive == true && (e.EndDate >= now || e.StartDate >= now))
                .OrderBy(e => e.StartDate)
                .Select(e => new
                {
                    id = e.EventId,
                    title = e.Title,
                    start = e.StartDate,
                    end = e.EndDate   // ✅ EndDate non-nullable, direkt kullan
                });

            return Ok(items);
        }

        // ---- Yönetim Paneli (Admin) ----

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] bool mine = false, [FromQuery] int? createdBy = null)
        {
            var events = await _eventService.GetAllAsync();

            // 🔎 Filtre mantığı:
            // 1) createdBy verilmişse -> o kullanıcınınkiler
            // 2) mine=true ise        -> token'daki kullanıcınınkiler
            // 3) hiçbiri yoksa        -> TÜM etkinlikler (doküman gereği)
            if (createdBy.HasValue)
            {
                events = events.Where(e => e.CreatedBy == createdBy.Value).ToList();
            }
            else if (mine)
            {
                var uidClaim = User.FindFirst("userId") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (uidClaim == null || !int.TryParse(uidClaim.Value, out var uid))
                    return Unauthorized();

                events = events.Where(e => e.CreatedBy == uid).ToList();
            }

            // CreatedByName eşlemesi (senin kodunla aynı)
            var users = await _userService.GetAllAsync();
            var userNameById = users.ToDictionary(u => u.UserId, u => u.NameSurname);

            var dtos = events
                .OrderBy(e => e.StartDate)   // en eski tarihten yeniye
                //.OrderByDescending(e => e.StartDate) // tam tersi (yeni → eski)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    ShortDescription = e.ShortDescription,
                    IsActive = e.IsActive,
                    CreatedByName = userNameById.TryGetValue(e.CreatedBy, out var name) ? name : null
                })
                .ToList();

            return Ok(dtos);
        }

        // (Opsiyonel kısa yol) /api/event/mine
        [HttpGet("mine")]
        [Authorize]
        public Task<IActionResult> GetMine() => GetAll(mine: true);

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var ev = await _eventService.GetByIdAsync(id);
            if (ev == null) return NotFound();

            var creator = await _userService.GetByIdAsync(ev.CreatedBy);

            var dto = new EventDetailDto
            {
                EventId = ev.EventId,
                Title = ev.Title,
                StartDate = ev.StartDate,
                EndDate = ev.EndDate,
                ShortDescription = ev.ShortDescription,
                LongDescription = ev.LongDescription,
                ImagePath = ev.ImagePath,
                IsActive = ev.IsActive,
                CreatedAt = ev.CreatedAt,
                CreatedByUser = creator == null ? null : new UserDto
                {
                    UserId = creator.UserId,
                    NameSurname = creator.NameSurname,
                    Email = creator.Email
                }
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
            {
                if (await _eventService.TitleExistsAsync(dto.Title))
                    return BadRequest("Bu başlığa sahip bir etkinlik zaten mevcut.");

                // ⬇️ JWT’den userId al
                var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                    return Unauthorized("Geçersiz token: userId yok.");

                var ev = new Event
                {
                    Title = dto.Title,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    ShortDescription = dto.ShortDescription,
                    LongDescription = dto.LongDescription,
                    ImagePath = dto.ImagePath,
                    IsActive = dto.IsActive,
                    CreatedBy = userId,                // ⬅️ yalnız token’dan
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _eventService.CreateAsync(ev);

                var result = new EventCreateResultDto
                {
                    EventId = created.EventId,
                    Title = created.Title,
                    StartDate = created.StartDate,
                    EndDate = created.EndDate,
                    ShortDescription = created.ShortDescription,
                    LongDescription = created.LongDescription,
                    ImagePath = created.ImagePath,
                    IsActive = created.IsActive,
                    CreatedAt = created.CreatedAt,
                    CreatedBy = created.CreatedBy      // sadece ID
                };

                return CreatedAtAction(nameof(GetById), new { id = result.EventId }, result);
            }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEventDto dto)
        {
            var existing = await _eventService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            // 🔒 sahiplik kontrolü
            var uid = GetUserId();
            if (uid is null) return Unauthorized();
            if (existing.CreatedBy != uid.Value)
                return Forbid("Bu etkinliği güncelleme yetkiniz yok.");

            if (!string.Equals(existing.Title, dto.Title, StringComparison.Ordinal) &&
                await _eventService.TitleExistsAsync(dto.Title))
            {
                return BadRequest("Bu başlığa sahip bir etkinlik zaten mevcut.");
            }

            existing.Title = dto.Title;
            existing.StartDate = dto.StartDate;
            existing.EndDate = dto.EndDate;
            existing.ShortDescription = dto.ShortDescription;
            existing.LongDescription = dto.LongDescription;
            existing.ImagePath = dto.ImagePath;
            existing.IsActive = dto.IsActive;
            // ❗ CreatedBy asla değişmez

            await _eventService.UpdateAsync(existing);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var ev = await _eventService.GetByIdAsync(id);
            if (ev == null) return NotFound();

            // 🔒 sahiplik kontrolü
            var uid = GetUserId();
            if (uid is null) return Unauthorized();
            if (ev.CreatedBy != uid.Value)
                return Forbid("Bu etkinliği silme yetkiniz yok.");

            await _eventService.DeleteAsync(id);
            return NoContent();
        }
    }
}