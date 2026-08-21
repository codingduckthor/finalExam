using Exam.Domain;
using Exam.Domain.Enums;
using Exam.DTOs.User;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateUserAsync(CreateUserDto dto)
    {
        var existingUser =
            await _repository.GetByLoginAsync(dto.Login);

        if (existingUser != null)
            throw new InvalidOperationException(
                "Пользователь уже существует.");

        var user = new User
        {
            Login = dto.Login,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        await _repository.AddAsync(user);

        await _repository.SaveChangesAsync();
    }

    public async Task<List<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await _repository.GetAllAsync();

        return users.Select(x => new UserResponseDto
        {
            Id = x.Id,
            Login = x.Login,
            Role = x.Role
        }).ToList();
    }
}
