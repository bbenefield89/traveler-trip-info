'use strict';

const profilesAPI = require('./api/profiles.service')
const tripsAPI = require('./api/trip.service')
const airlinesAPI = require('./api/airlines.service')

/**
 * @summary creates a new 'traveler' depending on the 'iter' parameter
 * 
 * @return {Object}
 */
const createTraveler = (profile, iter) => ({
  id: profile[iter].personId,
  name: profile[iter].name,
  flights: []
})

/**
 * @summary builds a new 'leg' object that will now contain the correct 'airlineName'
 *          and if applicable it will include the correct 'frequentFlyerNumber' or
 *          just an empty string
 * 
 * @return {Object}
 */
const getLeg = leg => ({
  airlineCode: leg.airlineCode,
  flightNumber: leg.flightNumber,
  airlineName: leg.airlineName,
  frequentFlyerNumber: leg.air[leg.airlineCode] || ''
})

/**
 * @summary Takes in the 'profiles', 'flights', and 'airlines' from each API
 *          call and uses that information to build out each traveler
 * 
 * @param {Object} profiles
 * @param {Object} flights
 * @param {Array}  airlines
 * 
 * @return {Object}
 */
const createTravelers = (profiles, flights, airlines) => {
  // allows us to easily access the airline name with a particular airline code
  const airlinesHash = airlines.reduce((acc, next) => {
    return { ...acc, [next.code]: next.name }
  }, {})
  
  /**
   * 'travelers' is our output. We will build up each 'traveler' and push them
   * into the 'travelers.travelers' array when that specific 'traveler' has ran
   * out of flights
   */
  const travelers = { travelers: [] }
  // will hold info about the current traveler being built
  let currentTraveler = {}
  let legs = []  // holds the leg(s) for each travelers flight
  let iP = 0     // profile iterator
  let iF = 0     // flight iterator
  let iTId = 0   // travelersId iterator
  let iL = 0     // leg iterator
  while (iP < profiles.length) {
    // create a new traveler if it doesnt exist
    if (!currentTraveler.id) {
      currentTraveler = createTraveler(profiles, iP)
    }

    /**
     * if our currentTraveler id matches the current flights travelerId then we
     * go ahead and build up the leg(s) of this flight
     */
    if (flights[iF].travelerIds[iTId] === currentTraveler.id) {
      const { airlineCode, flightNumber, } = flights[iF].legs[iL]
      const { air } = profiles[iP].rewardPrograms
      const airlineName = airlinesHash[airlineCode]
      const leg = getLeg({ airlineCode, flightNumber, airlineName, air })

      legs.push(leg)

      // if at the end of the leg(s) we move to the next flight
      if (++iL >= flights[iF].legs.length) {
        currentTraveler.flights.push({ legs })
        legs = []  // reset the leg(s) in preperation for the next flight
        iF++
        iL = 0
      }
    }
    // move on to the next flight if the traveler was not on the current flight
    else {
      iF++
    }

    /**
     * We've hit the end of the flights for this traveler. We need to push the
     * currentTraveler into the traveler.travelers array and clear the
     * currentTraveler object. Next we need to reset our flights iterator (iF),
     * move on to the next profile (iP), and increase our
     * traveler iterator (iTId)
     */
    if (iF >= flights.length) {
      travelers.travelers.push(currentTraveler)
      currentTraveler = {}  // reset the traveler so we can build a new one
      iF = 0
      iP++
      iTId++
    }
  }

  return travelers
}

/**
 * @summary Calls each API we need to build our travelers and uses the results
 *          from each API and passes them into the 'createTravelers' function
 *          and returns the value from that
 * 
 * @param {void}
 * 
 * @return {Object}
 */
async function getTravelersFlightInfo() {
  const { profiles } = await profilesAPI.get()
  const { trip: { flights } } = await tripsAPI.get()
  const { airlines } = await airlinesAPI.get()

  return createTravelers(profiles, flights, airlines)
}

getTravelersFlightInfo().then(data => console.log(JSON.stringify(data, null, 2)))

module.exports = getTravelersFlightInfo;