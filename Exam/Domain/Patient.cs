namespace Exam.Domain
{
    public class Patient
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public DateTime BirthDate { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; }

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; }
    = new List<MedicalRecord>();
    }
}
