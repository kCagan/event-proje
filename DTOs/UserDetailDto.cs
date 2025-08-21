namespace EventProje.Dtos
{
    public class UserDetailDto
    {
        public int UserId { get; set; }
        public string NameSurname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<EventDto> Events { get; set; } = new();
    }
}