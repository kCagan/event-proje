namespace EventProje.Dtos
{
    public class UpdateUserDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string NameSurname { get; set; } = null!;
        public DateTime BirthDate { get; set; }
    }
}
