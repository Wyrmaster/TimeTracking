namespace TimeTracking.Service.Configurations;

/// <summary>
///   Configuration holding the metadata to configure JWT Tokens
/// </summary>
/// <param name="Issuer">Name of the issuer of the Token</param>
/// <param name="Audience">Audience consuming this token</param>
/// <param name="SecretVariableName">Variable name a secret is stored</param>
public record TokenConfiguration(string Issuer, string Audience, string SecretVariableName)
{
  #region Constructor
  
  public TokenConfiguration() : this(string.Empty, string.Empty, string.Empty)
  {
    
  }

  #endregion
}