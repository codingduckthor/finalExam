namespace Exam.Domain
{
    public class Doctor
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int SpecialtyId { get; set; }
        public Specialty Specialty { get; set; } = null!;
        public int OfficeId { get; set; }
        public Office Office { get; set; } = null!;
        public int? UserId { get; set; }
        public User? User { get; set; }
        public ICollection<AppointmentSlot> AppointmentSlots { get; set; }
            = new List<AppointmentSlot>();
        public ICollection<DoctorSchedule> DoctorSchedules { get; set; }
            = new List<DoctorSchedule>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}
