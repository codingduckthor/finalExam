using System.ComponentModel.DataAnnotations;

namespace Exam.DTOs.Auth;

public class BootstrapAdminDto
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string Login { get; set; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
}
