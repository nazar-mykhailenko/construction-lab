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
        public string Test(List<ThreadDiagram> undividedDiagram)
        {
            List<ThreadDiagram> diagrams = undividedDiagram[0]
                .Nodes.Where(n => n.ParentId != null)
                .GroupBy(n => n.ParentId)
                .Select(g => new ThreadDiagram
                {
                    Nodes = g.ToList(),
                    Edges = undividedDiagram[0].Edges,
                })
                .ToList();
            var generator = new DiagramCodeGenerator();
            string code = generator.GenerateCodeFromDiagrams(diagrams);

            return code;
        }
    }
}
