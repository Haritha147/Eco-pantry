const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const InventoryItem = require('../models/InventoryItem');
const { validateDonationsCreate } = require('../middleware/validators');

// Simple memory cache to prevent rate-limiting from public API requests
const ngoCache = {};

// Mock fallback list of NGOs
const MOCK_NGOS = [
  { id: 'ngo1', name: 'Feeding India', distance: '1.2 km', type: 'Food Bank' },
  { id: 'ngo2', name: 'Robin Hood Army', distance: '3.5 km', type: 'Community Kitchen' },
  { id: 'ngo3', name: 'Local Community Shelter', distance: '5.0 km', type: 'Shelter' }
];

// Helper: Haversine distance formula in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

// @route   GET /api/donations/ngos
// @desc    Get list of nearby NGOs (using real geolocation if lat/lng provided)
router.get('/ngos', async (req, res) => {
  const { lat, lng } = req.query;

  // Local helper to generate close mock NGOs dynamically near user
  const generateLocalMocks = (latitude, longitude) => {
    return [
      {
        id: 'ngo_loc_1',
        name: 'Eco-Pantry Food Rescue Alliance',
        distance: '1.4 km',
        rawDistance: 1.4,
        type: 'Food Bank'
      },
      {
        id: 'ngo_loc_2',
        name: 'Robin Hood Rescue Kitchen',
        distance: '2.8 km',
        rawDistance: 2.8,
        type: 'Community Kitchen'
      },
      {
        id: 'ngo_loc_3',
        name: 'Local Charity & Care Home',
        distance: '4.2 km',
        rawDistance: 4.2,
        type: 'Shelter'
      }
    ];
  };

  if (!lat || !lng) {
    console.log('No location provided. Returning dynamic mock NGOs.');
    return res.json(generateLocalMocks(13.0827, 80.2707)); // default center
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = 50000; // Increased to 50 km for broader search coverage

    // Check memory cache first to prevent rate limiting (status 429)
    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    const cached = ngoCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < 15 * 60 * 1000)) { // 15-minute cache
      return res.json(cached.data);
    }

    let nearbyNgos = [];

    // Check if Google Maps API key is configured
    if (process.env.GOOGLE_MAPS_API_KEY) {
      console.log(`Using Google Places API to search for NGOs near lat: ${latitude}, lng: ${longitude}`);
      const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=NGO%20food%20bank%20charity&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      try {
        const googleRes = await fetch(googleUrl);
        if (googleRes.ok) {
          const googleData = await googleRes.json();
          if (googleData.results && googleData.results.length > 0) {
            nearbyNgos = googleData.results.map((place, index) => {
              const placeLat = place.geometry?.location?.lat;
              const placeLng = place.geometry?.location?.lng;
              const distanceKm = (placeLat && placeLng) ? getDistance(latitude, longitude, placeLat, placeLng) : 1.0;
              return {
                id: place.place_id || `google_${index}`,
                name: place.name || `NGO #${index + 1}`,
                distance: `${distanceKm.toFixed(1)} km`,
                rawDistance: distanceKm,
                type: place.types?.[0] || 'Charity',
                vicinity: place.vicinity || ''
              };
            });
          }
        } else {
          console.error(`Google Places API returned status ${googleRes.status}`);
        }
      } catch (googleErr) {
        console.error('Error querying Google Places API:', googleErr.message);
      }
    }

    // Fall back to Overpass API if no Google API key or Google Places returned empty results
    if (nearbyNgos.length === 0) {
      console.log(`Querying Overpass API with 50km radius for lat: ${latitude}, lng: ${longitude}...`);
      
      // Broader query to find NGOs, social facilities, food banks, places of worship (which often distribute food)
      const overpassQuery = `
        [out:json][timeout:15];
        (
          node["amenity"="social_facility"](around:${radius},${latitude},${longitude});
          node["office"="ngo"](around:${radius},${latitude},${longitude});
          node["ngo"="yes"](around:${radius},${latitude},${longitude});
          node["charity"="yes"](around:${radius},${latitude},${longitude});
          node["amenity"="community_centre"](around:${radius},${latitude},${longitude});
          node["amenity"="place_of_worship"](around:${radius},${latitude},${longitude});
          way["amenity"="social_facility"](around:${radius},${latitude},${longitude});
          way["office"="ngo"](around:${radius},${latitude},${longitude});
          way["amenity"="community_centre"](around:${radius},${latitude},${longitude});
          way["amenity"="place_of_worship"](around:${radius},${latitude},${longitude});
        );
        out center 30;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'EcoPantryCulinaryApp/1.0.0'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.elements && data.elements.length > 0) {
          nearbyNgos = data.elements.map((node, index) => {
            const elLat = node.lat || (node.center && node.center.lat);
            const elLon = node.lon || (node.center && node.center.lon);
            if (!elLat || !elLon) return null;

            const distanceKm = getDistance(latitude, longitude, elLat, elLon);
            return {
              id: `ngo_${node.id || index}`,
              name: node.tags.name || node.tags.operator || `Community NGO #${index + 1}`,
              distance: `${distanceKm.toFixed(1)} km`,
              rawDistance: distanceKm,
              type: node.tags.social_facility || node.tags.office || node.tags.amenity || 'Facility'
            };
          }).filter(item => item !== null);
        }
      } else {
        console.error(`Overpass API returned status ${response.status}`);
      }
    }

    // If still no NGOs found, generate localized short distance mock NGOs
    if (nearbyNgos.length === 0) {
      console.log('No nearby NGOs found in OSM or Google. Generating localized mock NGOs...');
      nearbyNgos = generateLocalMocks(latitude, longitude);
    }

    // Sort by nearest
    nearbyNgos.sort((a, b) => a.rawDistance - b.rawDistance);

    // Limit to top 5
    const finalNgos = nearbyNgos.slice(0, 5);

    // Save to cache
    ngoCache[cacheKey] = {
      timestamp: Date.now(),
      data: finalNgos
    };

    res.json(finalNgos);

  } catch (error) {
    console.error('Error fetching NGOs:', error.message);
    console.log('Falling back to local mock NGOs.');
    const fallbackMocks = generateLocalMocks(parseFloat(lat), parseFloat(lng));
    res.json(fallbackMocks);
  }
});

// @route   GET /api/donations
// @desc    Get user's donations
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const donations = await Donation.find({ user: userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/donations
// @desc    Create a new donation request
router.post('/', validateDonationsCreate, async (req, res) => {
  try {
    const { ngoId, ngoName, items, pickupAddress } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';

    if (!ngoId || !items || items.length === 0) {
      return res.status(400).json({ msg: 'Please provide NGO and items to donate' });
    }

    // 1. Create the donation
    const newDonation = new Donation({
      user: userId,
      ngoId,
      ngoName,
      items,
      pickupAddress: pickupAddress || 'User Default Address'
    });

    const savedDonation = await newDonation.save();

    // 2. Remove the donated items from the user's inventory
    // We match by name and userId
    for (const item of items) {
      const inventoryQuery = userId !== 'anonymous' 
        ? { user: userId, name: item.name } 
        : { name: item.name, $or: [{ user: null }, { user: { $exists: false } }] };
        
      const invItem = await InventoryItem.findOne(inventoryQuery);
      if (invItem) {
        if (invItem.quantity > item.quantity) {
          invItem.quantity -= item.quantity;
          await invItem.save();
        } else {
          await InventoryItem.findByIdAndDelete(invItem._id);
        }
      }
    }

    res.json(savedDonation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
