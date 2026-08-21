using Exam.DTOs.User;

namespace Exam.Interfaces.Services;

public interface IUserService
{
    Task CreateUserAsync(CreateUserDto dto);

    Task<List<UserResponseDto>> GetAllUsersAsync();
}