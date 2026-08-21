using BCrypt.Net;
using Exam.Domain;
using Exam.Domain.Enums;
using Exam.DTOs.Auth;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IPatientRepository _patientRepository;

    public AuthService(
        IUserRepository userRepository,
        IJwtService jwtService,
        IPatientRepository patientRepository)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _patientRepository = patientRepository;
    }

    public async Task RegisterAsync(RegisterDto dto)
    {
        var exists =
            await _userRepository.GetByLoginAsync(dto.Login);

        if (exists != null)
            throw new InvalidOperationException(
                "Пользователь уже существует.");

        var user = new User
        {
            Login = dto.Login,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Patient
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        await _patientRepository.AddAsync(new Patient
        {
            UserId = user.Id,
            FullName = dto.FullName,
            BirthDate = dto.BirthDate
        });
        await _patientRepository.SaveChangesAsync();
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user =
            await _userRepository.GetByLoginAsync(dto.Login);

        if (user == null)
            throw new InvalidOperationException(
                "Неверный логин или пароль.");

        var valid =
            BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash);

        if (!valid)
            throw new InvalidOperationException(
                "Неверный логин или пароль.");

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user)
        };
    }
}
