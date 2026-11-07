using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TimeTracking.Persistence.Converters;

/// <summary>
///   Stores timestamps as utc and marks timestamps read from the database as utc, as not every
///   database provider keeps the kind of a timestamp
/// </summary>
public class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>
(
  value => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime(),
  value => DateTime.SpecifyKind(value, DateTimeKind.Utc)
);
