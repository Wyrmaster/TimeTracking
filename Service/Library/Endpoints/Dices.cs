using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Common;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all dice operations 
/// </summary>
public static class Dices
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the Dice Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapDiceEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/dice/")
      .RequireAuthorization()
      .AddEndpointFilter<UserNameEndpointFilter>();

    group.MapPost("side/{sideId:int}/", Dices.UpdateSideAsync);
    group.MapPut("charge/{charge:int}/", Dices.UpdateCharge);
    group.MapGet("charge/", Dices.GetCharge);
    // kept for clients using the previous route, the charge in the route is ignored
    group.MapGet("charge/{charge:int}/", Dices.GetCharge);
    
    return self;
  }

  #endregion

  #region Endpoints

  /// <summary>
  ///   Update tracking by passing a new side id to the database
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="sideId"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> UpdateSideAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromRoute] int sideId,
    CancellationToken token = default
  )
  {
    string userName = context.GetRequiredUserName();

    return Results.Ok(await timeTrackingService.SetSideIdAsync(userName, sideId, token));
  }

  /// <summary>
  ///   Update the charge this is not persisted in the database
  /// </summary>
  /// <param name="context"></param>
  /// <param name="diceChargeStore">store keeping the charge levels</param>
  /// <param name="charge"></param>
  /// <returns></returns>
  private static IResult UpdateCharge
  (
    HttpContext context,
    IDiceChargeStore diceChargeStore,
    [FromRoute] int charge
  )
  {
    diceChargeStore.SetCharge(context.GetRequiredUserName(), charge);

    return Results.Ok();
  }

  /// <summary>
  ///   Returns the current Charge of the tracker
  /// </summary>
  /// <param name="context"></param>
  /// <param name="diceChargeStore">store keeping the charge levels</param>
  /// <returns>the charge level, -1 if the dice never reported one</returns>
  private static IResult GetCharge(HttpContext context, IDiceChargeStore diceChargeStore)
    => Results.Ok(diceChargeStore.GetCharge(context.GetRequiredUserName()));

  #endregion
}