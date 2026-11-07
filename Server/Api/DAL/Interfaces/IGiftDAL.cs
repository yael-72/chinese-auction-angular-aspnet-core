using FinalProject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FinalProject.DAL.Interfaces
{
    public interface IGiftDAL
    {
        public Task<List<Gift>> Get(string? name, string? donorName, int? amount, string? sort);
        public Task<Gift> GetById(int id);
        public Task Delete(int id);
        public Task Add(Gift gift);
        public Task Update(Gift gift);
        public Task DeleteAll(); // Add this line
    }
}
