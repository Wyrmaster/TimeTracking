using TimeTracking.Service.Extensions;

namespace TimeTracking.Service.Common;

/// <summary>
///   Rejects requests without a user name claim with 401, so endpoints can rely on an authenticated user name
/// </summary>
public class UserNameEndpointFilter : IEndpointFilter
{
  #region EndpointFilter

  /// <inheritdoc/>
  public ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    => context.HttpContext.GetUserName() == null
      ? ValueTask.FromResult<object?>(Results.Unauthorized())
      : next(context);

  #endregion
}
