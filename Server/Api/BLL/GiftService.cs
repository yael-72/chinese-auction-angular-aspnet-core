using AutoMapper;
using FinalProject.BLL.Interfaces;
using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using FinalProject.Models.DTO;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using System.Linq;
using FinalProject.Exceptions;

namespace FinalProject.BLL
{
    public class GiftService : IGiftService
    {
        private readonly IGiftDAL _giftDal;
        private readonly IMapper _mapper;
        public GiftService(IGiftDAL giftDal, IMapper mapper)
        {
            _giftDal = giftDal;
            _mapper = mapper;
        }

        public async Task<List<GiftDTO>> Get(string? name, string? donorName, int? amount, string? sort)
        {
            var gifts = await _giftDal.Get(name, donorName, amount, sort);
            return _mapper.Map<List<GiftDTO>>(gifts);
        }

        public async Task<GiftDTO> GetById(int id)
        {
            var g = await _giftDal.GetById(id);
            if (g == null)
                throw new NotFoundException($"מתנה עם מזהה {id} לא נמצאת במערכת. בדוק את המזהה וודא שהוא תקין.");
            return _mapper.Map<GiftDTO>(g);
        }

        public async Task Delete(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            
            await _giftDal.Delete(id);
        }

        public async Task DeleteAll()
        {
            await _giftDal.DeleteAll();
        }

        public async Task Add(GiftCreateDTO giftDTO)
        {
            if (giftDTO == null) 
                throw new ArgumentNullException(nameof(giftDTO), "נתוני המתנה נדרשים. אנא מלא את כל השדות הנדרשים כולל שם, מחיר וקטגוריה.");
            
            if (string.IsNullOrWhiteSpace(giftDTO.Name)) 
                throw new ArgumentException("שם המתנה נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם מתנה תקין.");
            
            if (giftDTO.Price < 0) 
                throw new ArgumentException("מחיר המתנה לא יכול להיות שלילי. אנא הזן מחיר של 0 ומעלה.");

            var existing = await _giftDal.Get(null, null, null, null);
            if (existing != null && existing.Any(g => string.Equals(g.Name, giftDTO.Name, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException($"מתנה בשם '{giftDTO.Name}' כבר קיימת במערכת. כל מתנה חייבת להיות בעלת שם ייחודי. בדוק את הנתונים ותוסף את הגרסה המתוקנת.");

            var gift = _mapper.Map<Gift>(giftDTO);
            await _giftDal.Add(gift);
        }

        public async Task Update(GiftDTO giftDTO)
        {
            if (giftDTO == null)
                throw new ArgumentNullException(nameof(giftDTO), "נתוני המתנה לעדכון נדרשים. אנא ספק את כל השדות הנדרשים.");
            
            if (giftDTO.Id <= 0)
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            
            if (giftDTO.Price < 0)
                throw new ArgumentException("מחיר המתנה לא יכול להיות שלילי. אנא הזן מחיר של 0 ומעלה.");

            var gift = _mapper.Map<Gift>(giftDTO);
            gift.SetId(giftDTO.Id);
            await _giftDal.Update(gift);
        }
    }
}
