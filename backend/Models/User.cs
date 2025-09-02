using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace EventProje.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string NameSurname { get; set; }
        public DateTime BirthDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [JsonIgnore]
        public List<Event> Events { get; set; } = new();
    }
}