using FinalProject.BLL.Interfaces;
using FinalProject.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _logger;
        public CategoryController(ICategoryService categoryService, ILogger<CategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> Get()
        {
            
            return Ok(await _categoryService.GetAll());
        }
        [HttpPost]
        public async Task<ActionResult> Add(CategoryCreateDTO category)
        {
            await _categoryService.Add(category);
            return Ok(new {message = $"קטגוריה '{category.Name}' נוספה בהצלחה"});
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _categoryService.Delete(id);
            return Ok(new {message = $"קטגוריה ID {id} נמחקה בהצלחה"});
        }
    }
}
