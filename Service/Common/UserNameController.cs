using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Common;

/// <summary>
/// 
/// </summary>
public class UserNameController: ControllerBase, IUserNameResolver;