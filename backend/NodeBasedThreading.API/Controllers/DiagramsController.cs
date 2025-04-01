using Microsoft.AspNetCore.Mvc;
using NodeBasedThreading.API.Models;
using NodeBasedThreading.API.Services;

namespace NodeBasedThreading.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagramsController : ControllerBase
    {
        [HttpPost("generate")]
        public string Test(List<ThreadDiagram> diagrams)
        {
            var generator = new DiagramCodeGenerator();
            string code = generator.GenerateCodeFromDiagrams(diagrams);

            return code;
        }
    }
}
