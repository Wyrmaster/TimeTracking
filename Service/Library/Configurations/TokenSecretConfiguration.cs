namespace TimeTracking.Service.Configurations;

/// <summary>
///   Configuration used to store the secret for the symmetric credentials
/// </summary>
/// <param name="Secret">symmetric key</param>
public record TokenSecretConfiguration(string Secret)
{
  #region Constructor

  public TokenSecretConfiguration()
    : this(string.Empty)
  { }

  #endregion
}