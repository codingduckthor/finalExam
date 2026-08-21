using Exam.Domain.Enums;

namespace Exam.DTOs.DoctorSchedule;

public class DoctorScheduleResponseDto
{
    public int Id { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public WeekDay DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}