function newCastle(name_, coord_) {
  return {
    name: name_,
    appearence: "standard",
    color: "#000000",
    id: 0,
    alive: true,
    collision: false,
    coord: {
      x: coord_.x,
      y: coord_.y
    },
    wall: {
      level: 1,
      state: {
        upgrading: false,
        startTime: 0
      }
    },
    dwellings: {
      level: 1,
      state: {
        upgrading: false,
        startTime: 0
      }
    },
    mine: {
      level: 1,
      state: {
        upgrading: false,
        startTime: 0
      }
    },
    sawmill: {
      level: 1,
      state: {
        upgrading: false,
        startTime: 0
      }
    },
    deposit: {
      level: 1,
      state: {
        upgrading: false,
        startTime: 0
      },
      stones: 1000000,
      wood: 1000000
    },
    barracks: {
      level: 1,
      state: {
        upgrading: false,
        startTime: 0
      }
    },
    units: {
      peasants: 10,
      knights: 2,
      mages: 0
    },
    trackedUnits: []
  };
}

export { newCastle };