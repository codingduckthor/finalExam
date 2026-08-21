using System.ComponentModel.DataAnnotations;
using Exam.Domain.Enums;

namespace Exam.DTOs.User;

public class CreateUserDto
{
    [Required]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}