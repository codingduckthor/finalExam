using Exam.DTOs.Office;
using Exam.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Exam.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfficeController : ControllerBase
{
    private readonly IOfficeService _service;

    public OfficeController(IOfficeService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateOfficeDto dto)
    {
        await _service.CreateAsync(dto);

        return Ok();
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await _service.GetAllAsync());
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);

        return Ok();
    }
}