import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";

module {
  type SearchRecord = {
    name : Text;
    timestamp : Int;
  };

  type OldActorState = {
    visits : Nat;
    searches : [SearchRecord];
    totalSearches : Nat;
    lastVisitTime : Int;
    maxSearches : Nat;
  };

  type NewActorState = {
    totalVisits : Nat;
    totalSearches : Nat;
    lastVisitTime : Int;
    searchesCount : Nat;
    maxSearches : Nat;
    recentSearches : Map.Map<Int, SearchRecord>;
  };

  public func run(old : OldActorState) : NewActorState {
    let recentSearches = Map.empty<Int, SearchRecord>();

    var count = 0;
    for (search in old.searches.values()) {
      if (count < old.maxSearches) {
        recentSearches.add(count, search);
        count += 1;
      };
    };

    {
      totalVisits = old.visits;
      totalSearches = old.totalSearches;
      lastVisitTime = old.lastVisitTime;
      searchesCount = count;
      maxSearches = 50;
      recentSearches;
    };
  };
};
