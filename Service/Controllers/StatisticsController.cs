using Microsoft.AspNetCore.Mvc;
using TimeTracking.Persistence;
using TimeTracking.Service.Common;

namespace TimeTracking.Service.Controllers;

/// <summary>
///   Controller used to calculate statistics based on timeentries
///   TODO to be impolemented
/// </summary>
[ApiController]
[Route("api/v1/statistics/")]
public class StatisticsController(Context context): UserNameController
{
  // TODO add statistics endpoints
}