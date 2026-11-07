using AutoMapper;
using FinalProject.BLL.Interfaces;
using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using FinalProject.Models.DTO;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using FinalProject.Exceptions;

namespace FinalProject.BLL
{
    public class CategoryService : ICategoryService
    {
        public readonly ICategoryDAL _categoryDAL;
        public readonly IMapper _mapper;

        public CategoryService(ICategoryDAL categoryDAL, IMapper mapper)
        {
            _categoryDAL = categoryDAL;
            _mapper = mapper;
        }
        public async Task<List<CategoryDTO>> GetAll()
        { 
            return _mapper.Map<List<CategoryDTO>>(await _categoryDAL.GetAll());
        }
        public async Task Add(CategoryCreateDTO categoryDTO)
        {
            if (categoryDTO == null) 
                throw new ArgumentNullException(nameof(categoryDTO), "נתוני הקטגוריה נדרשים. אנא הזן את שם הקטגוריה.");
            
            if (string.IsNullOrWhiteSpace(categoryDTO.Name)) 
                throw new ArgumentException("שם הקטגוריה נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם קטגוריה תקין.");

            var existing = await _categoryDAL.GetAll();
            if (existing != null && existing.Any(c => string.Equals(c.Name, categoryDTO.Name, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException($"קטגוריה בשם '{categoryDTO.Name}' כבר קיימת במערכת. כל קטגוריה חייבת להיות בעלת שם ייחודי. בדוק את הנתונים ותוסף את הגרסה המתוקנת.");

            await _categoryDAL.Add(_mapper.Map<Category>(categoryDTO));
        }
        public async Task Delete(int id)
        {
            if (id <= 0) 
                throw new ArgumentException("מזהה הקטגוריה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            await _categoryDAL.Delete(id);
        }

    }
}
