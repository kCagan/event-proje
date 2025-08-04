using EventProje.Models;
public class Event

{
    public int EventId { get; set; }
    public string Title { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string ShortDescription { get; set; }
    public string LongDescription { get; set; }
    public string ImagePath { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public int CreatedBy { get; set; }
    public User? User { get; set; } // 🔥 Nullable yapıldı
}
