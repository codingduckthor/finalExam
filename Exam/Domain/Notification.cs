namespace Exam.Domain
{
    public class Notification
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsSent { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}
