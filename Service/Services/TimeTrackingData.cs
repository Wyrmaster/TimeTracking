using System.Collections.Concurrent;
using TimeTracking.Service.Common;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="ITimeTrackingData"/>
public class TimeTrackingData: ITimeTrackingData
{
  #region Fields

  private readonly IDictionary<string,DiceData> _userData = new ConcurrentDictionary<string, DiceData>();

  #endregion
  
  #region TimeTrackingSide

  /// <inheritdoc cref="ITimeTrackingData.SetSideId"/>
  public void SetSideId(string username, int sideId)
  {
    if (!this._userData.ContainsKey(username))
    {
      this._userData[username] = new DiceData();
    }
    
    this._userData[username].ActiveDiceSide = sideId;
  }

  /// <inheritdoc cref="ITimeTrackingData.GetSideId"/>
  public int GetSideId(string username)
  {
    if (!this._userData.ContainsKey(username))
    {
      return -1;
    }

    return this._userData[username].ActiveDiceSide;
  }

  /// <inheritdoc cref="ITimeTrackingData.SetCharge"/>
  public void SetCharge(string username, int charge)
  {
    if (!this._userData.ContainsKey(username))
    {
      this._userData[username] = new DiceData();
    }
    
    this._userData[username].BatteryCharge = charge;
  }

  /// <inheritdoc cref="ITimeTrackingData.GetCharge"/>
  public int GetCharge(string username)
  {
    if (!this._userData.ContainsKey(username))
    {
      return -1;
    }

    return this._userData[username].BatteryCharge;
  }

  #endregion
}