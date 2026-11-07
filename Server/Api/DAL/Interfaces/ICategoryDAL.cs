using FinalProject.Models;

namespace FinalProject.DAL.Interfaces
{
    public interface ICategoryDAL
    {
        Task Add(Category category);
        Task Delete(int id);
        Task<List<Category>> GetAll();
    }
}