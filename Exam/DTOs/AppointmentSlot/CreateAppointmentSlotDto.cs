namespace Exam.DTOs.AppointmentSlot;

public class CreateAppointmentSlotDto
{
    public int DoctorId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }
}