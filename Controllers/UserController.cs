using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EventProje.Models;
using EventProje.Services.Interfaces;
using EventProje.Dtos;
using EventProje.Services;
using System.Linq;

namespace EventProje.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Varsayılan: korumalı. İstisnaları [AllowAnonymous] ile açacağız.
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly EncryptionService _encryptionService;
        private readonly JwtService _jwtService;

        private int? GetUserId()
        {
            var claim = User.FindFirst("userId") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : (int?)null;
        }

        public UserController(IUserService userService, EncryptionService encryptionService, JwtService jwtService)
        {
            _userService = userService;
            _encryptionService = encryptionService;
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();

            var dtos = users.Select(u => new UserDetailDto
            {
                UserId = u.UserId,
                NameSurname = u.NameSurname,
                Email = u.Email,
                BirthDate = u.BirthDate,
                CreatedAt = u.CreatedAt,
                Events = u.Events?.Select(e => new EventDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsActive = e.IsActive
                }).ToList()
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();

            var dto = new UserDetailDto
            {
                UserId = user.UserId,
                NameSurname = user.NameSurname,
                Email = user.Email,
                BirthDate = user.BirthDate,
                CreatedAt = user.CreatedAt,
                Events = user.Events?.Select(e => new EventDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsActive = e.IsActive
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            if (await _userService.EmailExistsAsync(dto.Email))
                return BadRequest("Bu e-posta ile zaten bir kullanıcı var.");

            var user = new User
            {
                NameSurname = dto.NameSurname,
                Email = dto.Email,
                Password = _encryptionService.Encrypt(dto.Password), // Gereksinime uygun: şifrelenebilir
                BirthDate = dto.BirthDate,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _userService.CreateAsync(user);

            var detailDto = new UserDetailDto
            {
                UserId = created.UserId,
                NameSurname = created.NameSurname,
                Email = created.Email,
                BirthDate = created.BirthDate,
                CreatedAt = created.CreatedAt,
                Events = new List<EventDto>()
            };

            return CreatedAtAction(nameof(GetById), new { id = detailDto.UserId }, detailDto);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest dto)
        {
            var user = await _userService.GetByEmailAsync(dto.Email);
            if (user == null) return Unauthorized("Kullanıcı bulunamadı.");

            var decryptedPassword = _encryptionService.Decrypt(user.Password);
            if (decryptedPassword != dto.Password)
                return Unauthorized("Şifre yanlış.");

            var token = _jwtService.GenerateToken(user);
            return Ok(new { token });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            // 🔒 sahiplik kontrolü
            var uid = GetUserId();
            if (uid is null) return Unauthorized();
            if (uid.Value != id)
                return Forbid("Sadece kendi hesabınızı güncelleyebilirsiniz.");

            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();

            // E-posta çakışma kontrolü
            if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase) &&
                await _userService.EmailExistsAsync(dto.Email))
            {
                return BadRequest("Bu e-posta başka bir kullanıcı tarafından kullanılıyor.");
            }

            user.NameSurname = dto.NameSurname;
            user.Email = dto.Email;
            user.BirthDate = dto.BirthDate;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = _encryptionService.Encrypt(dto.Password);
            }

            await _userService.UpdateAsync(user);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            // 🔒 sahiplik kontrolü
            var uid = GetUserId();
            if (uid is null) return Unauthorized();
            if (uid.Value != id)
                return Forbid("Sadece kendi hesabınızı silebilirsiniz.");

            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();

            await _userService.DeleteAsync(id);
            return NoContent();
        }
    }
}
