using Exam.DTOs.Auth;
using Exam.Interfaces.Services;
using Exam.Interfaces.Repositories;
using Exam.Domain;
using Exam.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;
    private readonly IUserRepository _userRepository;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IAuthService service, IUserRepository userRepository, IWebHostEnvironment environment)
    {
        _service = service;
        _userRepository = userRepository;
        _environment = environment;
    }
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            await _service.RegisterAsync(dto);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }

        return Ok("Пользователь зарегистрирован.");
    }

    [AllowAnonymous]
    [HttpPost("bootstrap-admin")]
    public async Task<IActionResult> BootstrapAdmin(BootstrapAdminDto dto)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        if ((await _userRepository.GetAllAsync()).Any(user => user.Role == UserRole.Admin))
            return BadRequest(new { message = "Первый администратор уже создан." });

        var user = new User
        {
            Login = dto.Login,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Admin
        };
        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok("Первый администратор создан.");
    }
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        LoginDto dto)
    {
        try
        {
            return Ok(await _service.LoginAsync(dto));
        }
        catch (InvalidOperationException)
        {
            // Do not reveal whether the login exists.
            return Unauthorized(new { message = "Неверный логин или пароль." });
        }
    }
}
