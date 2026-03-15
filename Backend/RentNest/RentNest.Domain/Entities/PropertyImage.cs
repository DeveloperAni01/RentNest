//Images Model for storing images

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentNest.Domain.Entities
{
    public class PropertyImage
    {
        //Primary key
        [Key]
        public int ImageId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        public int DisplayOrder { get; set; } //for cover img showibg

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;
    }
}
