using Microsoft.AspNetCore.Mvc;
using TimeTracking.Persistence;

namespace TimeTracking.Service.Controllers;

[Route("api/v1/test/")]
public class TestController: ControllerBase
{
  private Context context;

  public TestController(Context context)
  {
    this.context = context;
  }

  [HttpGet]
  public IActionResult Test()
  {
    return this.Ok(this.context.TimeEntries.Count());
  }
}