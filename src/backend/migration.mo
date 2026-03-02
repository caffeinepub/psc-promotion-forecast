import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type OldActor = {
    visits : Nat;
    searches : [{ name : Text; timestamp : Int }];
    totalSearches : Nat;
    lastVisitTime : Int;
    maxSearches : Nat;
  };

  type NewActor = {
    visits : Nat;
    searches : [{ name : Text; timestamp : Int }];
    totalSearches : Nat;
    lastVisitTime : Int;
    maxSearches : Nat;
    employeeCounts : Map.Map<Text, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    { old with employeeCounts = Map.empty<Text, Nat>() };
  };
};
