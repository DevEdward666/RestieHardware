using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestieAPI.Models.Response;
using RestieAPI.Service.Repo;

namespace RestieAPI.Controllers.Ocr
{
    [ApiController]
    [Route("api/[controller]/")]
    public class OcrController : ControllerBase
    {
        private readonly OcrRepo _ocrRepo;

        public OcrController(IConfiguration configuration)
        {
            _ocrRepo = new OcrRepo(configuration);
        }

        /// <summary>
        /// POST api/ocr/extract
        /// Accepts a multipart/form-data upload with a single image file (field name: "file").
        /// Returns the raw extracted text and per-line breakdown.
        /// </summary>
        [Authorize]
        [HttpPost("extract")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB max
        public IActionResult Extract([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new OcrExtractResponse
                {
                    status = 400,
                    message = "No file was uploaded. Send the image as 'file' in a multipart/form-data request."
                });
            }

            // Validate MIME type – only accept common image formats
            var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/tiff", "image/bmp" };
            if (!allowed.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new OcrExtractResponse
                {
                    status = 400,
                    message = $"Unsupported file type '{file.ContentType}'. Accepted: jpeg, png, webp, tiff, bmp."
                });
            }

            try
            {
                using var stream = file.OpenReadStream();
                var result = _ocrRepo.ExtractText(stream, file.FileName);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new OcrExtractResponse
                {
                    status = 500,
                    message = $"OCR processing failed: {ex.GetType().Name}: {ex.Message}{(ex.InnerException != null ? " | " + ex.InnerException.Message : "")}"
                });
            }
        }
    }
}
