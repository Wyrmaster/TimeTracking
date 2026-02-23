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
public class StatisticsController: UserNameController
{
  #region Fields

  private readonly Context _context;

  #endregion

  #region Constructor

  public StatisticsController(Context context)
  {
    this._context = context;
  }

  #endregion
}