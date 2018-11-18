'use strict';

const profilesAPI = require('./api/profiles.service')
const tripsAPI = require('./api/trip.service')
const airlinesAPI = require('./api/airlines.service')

async function getTravelersFlightInfo() {
  try {
    const { profiles } = await profilesAPI.get()
    const { trip: { flights } } = await tripsAPI.get()
    const { airlines } = await airlinesAPI.get()
    const travelers = { travelers: [] }
  
    profiles.forEach(profile => {
      const traveler = {
        id: profile.personId,
        name: profile.name,
        flights: []
      }

      let bar = []

      flights.forEach(({ travelerIds, legs }) => {
        travelerIds.forEach(id => {
          if (traveler.id === id) {
            legs.forEach(({ airlineCode, flightNumber }) => {
              const foo = { airlineCode, flightNumber }
              
              airlines.forEach(({ code, name }) => {
                if (airlineCode === code) {
                  const { air } = profile.rewardPrograms

                  foo.airlineName = name
                  foo.frequentFlyerNumber = air[ code ] ? air[ code ] : ''

                  bar.push(foo)
                }
              })
            })

            traveler.flights.push({ legs: bar })
            bar = []
          }
        })
      })

      travelers.travelers.push(traveler)
    })

    console.log(JSON.stringify(travelers, null, 2))
  }
  catch (err) {
    console.log(err)
  }
}

console.log(getTravelersFlightInfo())

module.exports = getTravelersFlightInfo;

const foo = () => {
  return {
    travelers: [
      {
        id: 1,
        name: 'Neo',
        flights: [
          {
            legs: [
              {
                airlineCode: 'AA',
                airlineName: 'American',
                flightNumber: 'AA456',
                frequentFlyerNumber: ''
              }
            ]
          },
          {
            legs: [
              {
                airlineCode: 'VA',
                airlineName: 'Virgin',
                flightNumber: 'VA789',
                frequentFlyerNumber: 'NVA123'
              },
              {
                airlineCode: 'AK',
                airlineName: 'Alaskan',
                flightNumber: 'AK789',
                frequentFlyerNumber: 'NAK123'
              }
            ]
          }
        ]
      }
    ]
  };

  profiles.profiles.forEach(profile => {
    const { personId: id, name, rewardPrograms: { air } } = profile
    travelers.travelers.push({
      id,
      name,
      flights: []
    })
  })

  trips.trip.flights.forEach(({ travelerIds, legs }) => {
    
  })

  // iterators
  let iProfile = 0
  let iFlights = 0
  let iTravelerIds = 0
  let iLegs = 0
  let iAirlines = 0
  while (iProfile < profiles.length) {
    const { personId: id, name, rewardPrograms } = profiles[ iProfile++ ]
    const traveler = { id, name }

    
  }
  
  // trips.trip.flights.forEach(({ travelerIds, legs }, ind) => {
  //   travelers[ travelerIds[ ind ] ].flights.push({ legs })
  // })
}