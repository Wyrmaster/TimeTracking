using System.Collections.Concurrent;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="IDiceChargeStore"/>
/// <remarks>registered as singleton, so the charge levels survive between requests</remarks>
public class DiceChargeStore : IDiceChargeStore
{
  #region Fields

  private readonly ConcurrentDictionary<string, int> _charges = new();

  #endregion

  #region DiceChargeStore

  /// <inheritdoc cref="IDiceChargeStore.SetCharge"/>
  public void SetCharge(string username, int charge) => this._charges[username] = charge;

  /// <inheritdoc cref="IDiceChargeStore.GetCharge"/>
  public int GetCharge(string username) => this._charges.GetValueOrDefault(username, -1);

  #endregion
}
