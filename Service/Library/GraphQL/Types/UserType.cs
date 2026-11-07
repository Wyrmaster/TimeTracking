using TimeTracking.Persistence.Entities;

namespace TimeTracking.Service.GraphQL.Types;

/// <summary>
///   GraphQL type of a <see cref="User"/>, reachable through the workspaces
/// </summary>
public class UserType : ObjectType<User>
{
  #region Overrides

  /// <inheritdoc/>
  protected override void Configure(IObjectTypeDescriptor<User> descriptor)
  {
    // the password hash must never leave the server
    descriptor
      .Field(user => user.Password)
      .Ignore();
  }

  #endregion
}
