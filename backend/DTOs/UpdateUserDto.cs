public class UpdateUserDto
{
    public string Email { get; set; } = null!;
    public string NameSurname { get; set; } = null!;
    public DateTime? BirthDate { get; set; }

    public string? Password { get; set; }          // Yeni şifre
    public string? CurrentPassword { get; set; }  // Mevcut şifre
}