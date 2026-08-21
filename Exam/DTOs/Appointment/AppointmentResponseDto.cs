namespace Exam.DTOs.Appointment
{
    public class AppointmentResponseDto
    {
        public int AppointmentId { get; set; }

        public int AppointmentSlotId { get; set; }

        public string DoctorName { get; set; } = string.Empty;

        public string Specialty { get; set; } = string.Empty;

        public string PatientName { get; set; } = string.Empty;

        public int PatientId { get; set; }

        public DateTime DateTime { get; set; }
    }
}

