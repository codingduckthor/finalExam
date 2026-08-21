namespace Exam.DTOs.AppointmentSlot;

public class AppointmentSlotResponseDto
{
    public int Id { get; set; }

    public string DoctorName { get; set; } = string.Empty;

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public bool IsBooked { get; set; }
}