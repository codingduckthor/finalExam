namespace Exam.DTOs.Appointment
{
    public class CreateAppointmentDto
    {
        public int PatientId { get; set; }
        public string PatientFullName { get; set; } = string.Empty;

        public int AppointmentSlotId { get; set; }
    }
}
