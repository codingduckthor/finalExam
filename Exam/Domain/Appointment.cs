using Exam.Domain.Enums;

namespace Exam.Domain
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient Patient { get; set; } = null!;
        public int AppointmentSlotId { get; set; }
        public AppointmentSlot AppointmentSlot { get; set; } = null!;
        public AppointmentStatus Status { get; set; }
        public MedicalRecord? MedicalRecord { get; set; }
    }
}
