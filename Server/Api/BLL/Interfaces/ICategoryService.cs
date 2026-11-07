using FinalProject.Models.DTO;

namespace FinalProject.BLL.Interfaces
{
    public interface ICategoryService
    {
        Task Add(CategoryCreateDTO categoryDTO);
        Task Delete(int id);
        Task<List<CategoryDTO>> GetAll();
    }
}