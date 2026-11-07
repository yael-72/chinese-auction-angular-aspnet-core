using AutoMapper;
using FinalProject.BLL.Interfaces;
using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using FinalProject.Models.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using FinalProject.Exceptions;

namespace FinalProject.BLL
{
    public class DonorService : IDonorService
    {
        private readonly IDonorDAL _donorDAL;
        private readonly IMapper _mapper;
        public DonorService(IDonorDAL donorDAL, IMapper mapper)
        {
            _donorDAL = donorDAL;
            _mapper = mapper;
        }

        public async Task Add(DonorCreateDTO donorDTO)
        {
            if (donorDTO == null) 
                throw new ArgumentNullException(nameof(donorDTO), "נתוני התורם נדרשים. אנא מלא את כל השדות הנדרשים כולל שם, דוא״ל וכל המידע הדרוש.");
            
            if (string.IsNullOrWhiteSpace(donorDTO.Name)) 
                throw new ArgumentException("שם התורם נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם תורם תקין.");

            // check duplicate by name (case-insensitive)
            var existing = await _donorDAL.Get(null, null, null);
            if (existing != null && existing.Any(d => string.Equals(d.Name, donorDTO.Name, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException($"תורם בשם '{donorDTO.Name}' כבר קיים במערכת. כל תורם חייב להיות בעל שם ייחודי. בדוק את הנתונים ותרום את הגרסה המתוקנת.");

            var donor = _mapper.Map<Donor>(donorDTO);
            await _donorDAL.Add(donor);
        }

        public async Task Delete(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה התורם חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            
            await _donorDAL.Delete(id);
        }

        public async Task<List<DonorDTO>> Get(string? email, string? name, string? giftName)
        {
            var donors = await _donorDAL.Get(email,name,giftName);
            return _mapper.Map<List<DonorDTO>>(donors);
        }

        public async Task<DonorDTO> GetById(int id)
        {
            var d = await _donorDAL.GetById(id);
            if (d == null) 
                throw new NotFoundException($"תורם עם מזהה {id} לא נמצא במערכת. בדוק את המזהה וודא שהוא תקין.");
            return _mapper.Map<DonorDTO>(d);
        }

        public async Task Update(DonorDTO donorDTO)
        {
            if (donorDTO == null)
                throw new ArgumentNullException(nameof(donorDTO), "נתוני התורם לעדכון נדרשים. אנא ספק את כל השדות הנדרשים.");
            
            if (donorDTO.Id <= 0)
                throw new ArgumentException("מזהה התורם חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");

            var donor = _mapper.Map<Donor>(donorDTO);
            donor.SetId(donorDTO.Id);
            await _donorDAL.Update(donor);
        }
    }
}
