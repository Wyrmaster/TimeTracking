namespace TimeTracking.Service.Common;

/// <summary>
///   Current Dice Data
/// </summary>
public class DiceData
{
  #region Properties

  /// <summary>
  ///   Current Active Dice Side
  /// </summary>
  public int ActiveDiceSide { get; set; }

  /// <summary>
  ///   Current Battery Charge of the Dice
  /// </summary>
  public int BatteryCharge { get; set; }

  #endregion
}