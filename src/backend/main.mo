import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Migration "migration";

(with migration = Migration.run)
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

  var totalVisits = 0;
  var totalSearches = 0;
  var lastVisitTime : Int = 0;

  // Map to keep track of recent searches, sorted by timestamp
  let recentSearches = Map.empty<Int, SearchRecord>();
  var searchesCount = 0; // New variable to track number of searches
  let maxSearches = 50;

  let employeeCounts = Map.empty<Text, Nat>();

  public func incrementVisits() : async Nat {
    totalVisits += 1;
    lastVisitTime := Time.now();
    totalVisits;
  };

  public query func getVisits() : async Nat {
    totalVisits;
  };

  public func recordSearch(name : Text) : async Nat {
    let timestamp = Time.now();
    let newRecord = { name; timestamp };

    // Add new search and remove the oldest if we exceed the limit
    if (searchesCount >= maxSearches) {
      // Find the oldest timestamp (smallest key)
      let minKey = recentSearches.keys().toArray().foldLeft(?timestamp, func(acc, k) { ?Int.min(k, switch (acc) { case (null) { k }; case (?a) { a } }) });
      switch (minKey) {
        case (null) {}; // This case should not happen with non-empty map
        case (?k) {
          recentSearches.remove(k);
          searchesCount -= 1;
        };
      };
    };

    recentSearches.add(timestamp, newRecord);
    searchesCount += 1;

    totalSearches += 1;

    // Update per-employee count
    switch (employeeCounts.get(name)) {
      case (null) { employeeCounts.add(name, 1) };
      case (?count) { employeeCounts.add(name, count + 1) };
    };

    totalSearches;
  };

  // Get the most recent searches in descending timestamp order
  public query func getRecentSearches(limit : Nat) : async [SearchRecord] {
    let iter = recentSearches.toArray();
    let sorted = iter.sort(
      func(a, b) {
        Int.compare(b.0, a.0);
      }
    );
    let entries = sorted.map(func(entry) { entry.1 });
    let safeLimit = Int.abs(limit);
    if (entries.size() <= safeLimit) {
      entries;
    } else {
      entries.sliceToArray(0, safeLimit);
    };
  };

  public query func getStats() : async Stats {
    {
      totalVisits;
      totalSearches;
      lastVisitTime;
    };
  };

  public query ({ caller }) func getMostSearched(limit : Nat) : async [EmployeeCount] {
    let countsArray = employeeCounts.toArray().map(func((name, count)) { { name; count } });
    let sorted = countsArray.sort(
      func(a, b) {
        Nat.compare(b.count, a.count);
      }
    );

    let safeLimit = Int.abs(limit);
    if (sorted.size() <= safeLimit) {
      sorted;
    } else {
      sorted.sliceToArray(0, safeLimit);
    };
  };
};
