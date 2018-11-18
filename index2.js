'use strict';

const profilesAPI = require('./api/profiles.service')
const tripsAPI = require('./api/trip.service')
const airlinesAPI = require('./api/airlines.service')

const setTraveler = (profile, iter) => ({
    id: profile[ iter ].personId,
    name: profile[ iter ].name,
    flights: []
})

const setAirlineHash = airlines => {
  const hash = {}
  airlines.forEach(airline => {
    hash[ airline.code ] = airline.name
  })

  return hash
}

const setLegs = ({ airlineCode, flightNumber, airlineName, air }) => ({
  airlineCode,
  flightNumber,
  airlineName,
  frequentFlyerNumber: air[ airlineCode ] ? air[ airlineCode ] : ''
})

async function getTravelersFlightInfo() {
  const { profiles } = await profilesAPI.get()
  const { trip: { flights } } = await tripsAPI.get()
  const { airlines } = await airlinesAPI.get()
  const travelers = { travelers: [] }

  const airlinesHash = setAirlineHash(airlines)

  let currentTraveler = {}
  let legs = []
  let iP = 0
  let iF = 0
  let iTID = 0 
  let iL = 0
  while (iP < profiles.length) {
    if (!currentTraveler.id) {
      currentTraveler = setTraveler(profiles, iP)
    }

    if (flights[ iF ].travelerIds[ iTID ] === currentTraveler.id) {
      const { airlineCode, flightNumber, } = flights[ iF ].legs[ iL ]
      const { air } = profiles[ iP ].rewardPrograms
      const airlineName = airlinesHash[ airlineCode ]
      const data = setLegs({ airlineCode, flightNumber, airlineName, air })
      
      legs.push(data)

      // increase iF and reset IL if at the end of legs
      if (++iL >= flights[ iF ].legs.length) {
        currentTraveler.flights.push({ legs })
        legs = []

        // move to the next profile when we hit the end of flights
        if (++iF >= flights.length) {
          travelers.travelers.push(currentTraveler)
          currentTraveler = {}
          iF = 0
          iP++
          iTID++
        }
        
        iL = 0
      }
    }
    else {
      if (++iF >= flights.length) {
        travelers.travelers.push(currentTraveler)
        currentTraveler = {}
        iF = 0
        iP++
      }
    }
  }

  console.log(JSON.stringify(travelers, null, 2))
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
}