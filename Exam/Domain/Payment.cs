namespace Exam.Domain
{
    public class Payment
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public bool IsPaid { get; set; }
    }
}
