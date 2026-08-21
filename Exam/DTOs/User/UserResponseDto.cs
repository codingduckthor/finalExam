using Exam.Domain.Enums;
namespace Exam.DTOs.User;

public class UserResponseDto
{
    public int Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}