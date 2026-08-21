using Exam.Domain.Enums;

namespace Exam.DTOs.DoctorSchedule;

public class CreateDoctorScheduleDto
{
    public int DoctorId { get; set; }
    public WeekDay DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}