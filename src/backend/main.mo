import Migration "migration";
(with migration = Migration.run)
actor {
  var visits = 0;

  public query ({ caller }) func ping() : async Text {
    "ok";
  };

  public func incrementVisits() : async Nat {
    visits += 1;
    visits;
  };

  public query ({ caller }) func getVisits() : async Nat {
    visits;
  };
};
