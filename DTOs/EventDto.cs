namespace EventProje.Dtos
{
    public class EventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ShortDescription { get; set; } = null!;
        public bool IsActive { get; set; }
        public string? CreatedByName { get; set; } // User.NameSurname
    }
}