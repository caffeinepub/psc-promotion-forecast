import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";


// Use `with` clause to run migration on upgrade

actor {
  public type SearchRecord = {
    name : Text;
    timestamp : Int;
  };

  public type Stats = {
    totalVisits : Nat;
    totalSearches : Nat;
    lastVisitTime : Int;
  };

  public type EmployeeCount = {
    name : Text;
    count : Nat;
  };

  var visits = 0;
  var searches : [SearchRecord] = [];
  var totalSearches = 0;
  var lastVisitTime : Int = 0;
  let maxSearches = 50;

  // Persistent (stable) map for employee search counts
  let employeeCounts = Map.empty<Text, Nat>();

  public func incrementVisits() : async Nat {
    visits += 1;
    lastVisitTime := Time.now();
    visits;
  };

  public query func getVisits() : async Nat {
    visits;
  };

  public func recordSearch(name : Text) : async Nat {
    let timestamp = Time.now();
    let newRecord = { name; timestamp };

    // Add to recent searches (max 50)
    let newSearches = [newRecord].concat(searches).sliceToArray(0, maxSearches);
    searches := newSearches;

    // Update total searches
    totalSearches += 1;

    // Update per-employee count
    let currentCount = switch (employeeCounts.get(name)) {
      case (?count) { count };
      case (null) { 0 };
    };
    employeeCounts.add(name, currentCount + 1);

    totalSearches;
  };

  public query func getRecentSearches(limit : Nat) : async [SearchRecord] {
    let safeLimit = if (limit > maxSearches) { maxSearches } else { limit };
    searches.sliceToArray(0, safeLimit);
  };

  public query func getStats() : async Stats {
    {
      totalVisits = visits;
      totalSearches;
      lastVisitTime;
    };
  };

  public query ({ caller }) func getMostSearched(limit : Nat) : async [EmployeeCount] {
    // Convert to array for sorting
    let countsArray = employeeCounts.toArray().map(func((name, count)) { { name; count } });

    // Sort descending by count
    let sorted = countsArray.sort(
      func(a, b) {
        Nat.compare(b.count, a.count);
      }
    );

    // Take the top N
    let safeLimit = if (limit > sorted.size()) { sorted.size() } else { limit };
    sorted.sliceToArray(0, safeLimit);
  };
};
