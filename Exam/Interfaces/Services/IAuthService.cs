using Exam.DTOs.Auth;

namespace Exam.Interfaces.Services;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto dto);

    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
