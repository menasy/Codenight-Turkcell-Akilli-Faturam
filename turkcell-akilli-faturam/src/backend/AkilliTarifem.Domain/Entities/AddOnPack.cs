using AkilliTarifem.Domain.Common;

namespace AkilliTarifem.Domain.Entities
{
    /// <summary>
    /// Ek paket bilgilerini temsil eden entity.
    /// Single Responsibility prensibini takip eder.
    /// </summary>
    public class AddOnPack : BaseEntity
    {
        private string _name = string.Empty;
        private decimal _price;

        public string Name 
        { 
            get => _name; 
            set => _name = !string.IsNullOrWhiteSpace(value) ? value.Trim() : throw new ArgumentException("AddOn name cannot be empty");
        }

        public AddOnType Type { get; set; }
        public decimal ExtraGb { get; set; }
        public int ExtraMin { get; set; }
        public int ExtraSms { get; set; }

        public decimal Price 
        { 
            get => _price; 
            set => _price = value >= 0 ? value : throw new ArgumentException("Price cannot be negative");
        }

        public bool IsActive { get; set; } = true;
        
        // Navigation Properties
        public virtual ICollection<UserAddOnPack> UserAddOnPacks { get; set; } = new List<UserAddOnPack>();

        // Factory method
        public static AddOnPack Create(string name, AddOnType type, decimal price, decimal extraGb = 0, int extraMin = 0, int extraSms = 0)
        {
            return new AddOnPack
            {
                Name = name,
                Type = type,
                Price = price,
                ExtraGb = extraGb,
                ExtraMin = extraMin,
                ExtraSms = extraSms
            };
        }

        // Domain methods
        public bool IsBetterValueThan(AddOnPack other)
        {
            if (Type != other.Type) return false;

            return Type switch
            {
                AddOnType.Data => ExtraGb > 0 && other.ExtraGb > 0 && (ExtraGb / Price) > (other.ExtraGb / other.Price),
                AddOnType.Voice => ExtraMin > 0 && other.ExtraMin > 0 && (ExtraMin / Price) > (other.ExtraMin / other.Price),
                AddOnType.Sms => ExtraSms > 0 && other.ExtraSms > 0 && (ExtraSms / Price) > (other.ExtraSms / other.Price),
                _ => false
            };
        }

        public decimal GetValuePerUnit()
        {
            return Type switch
            {
                AddOnType.Data => ExtraGb > 0 ? Price / ExtraGb : 0,
                AddOnType.Voice => ExtraMin > 0 ? Price / ExtraMin : 0,
                AddOnType.Sms => ExtraSms > 0 ? Price / ExtraSms : 0,
                _ => 0
            };
        }
    }

    public enum AddOnType
    {
        Data = 1,
        Voice = 2,
        Sms = 3,
        Mixed = 4
    }
}