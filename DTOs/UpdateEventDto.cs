namespace EventProje.Dtos
{
    public class UpdateEventDto
    {
        public string Title { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ShortDescription { get; set; }
        public string LongDescription { get; set; }
        public string ImagePath { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
    }
}