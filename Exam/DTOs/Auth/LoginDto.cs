namespace Exam.DTOs.Auth;

public class LoginDto
{
    [System.ComponentModel.DataAnnotations.Required]
    public string Login { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    public string Password { get; set; } = string.Empty;
}
