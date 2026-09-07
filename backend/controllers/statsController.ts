import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { CATEGORIES_LIST, CITIES_LIST, INITIAL_STATS } from '../../src/data/initialData';
import { PlatformStatsConfig } from '../../src/types';
import { creatorsStore } from './creatorController';

let statsStore: PlatformStatsConfig = { ...INITIAL_STATS };
const categoriesStore = [...CATEGORIES_LIST];
const citiesStore = [...CITIES_LIST];

export async function getHealth(req: Request, res: Response) {
  const dbCount = await dbQuery('SELECT COUNT(*) as cnt FROM creators');
  const count = dbCount?.[0]?.cnt || creatorsStore.length;

  res.json({
    status: 'ok',
    platform: 'thebrandsstory. - India’s Biggest Influencer Platform',
    timestamp: new Date().toISOString(),
    creatorsCount: count,
  });
}

export async function getCategories(req: Request, res: Response) {
  const dbCats = await dbQuery('SELECT id, name, slug, icon_name as iconName, image, description, count FROM categories ORDER BY count DESC');
  if (dbCats && dbCats.length > 0) {
    return res.json({ success: true, categories: dbCats });
  }
  res.json({ success: true, categories: categoriesStore });
}

export async function getCities(req: Request, res: Response) {
  const dbCities = await dbQuery('SELECT id, name, slug, state, tier, image, count FROM cities ORDER BY count DESC');
  if (dbCities && dbCities.length > 0) {
    return res.json({ success: true, cities: dbCities });
  }
  res.json({ success: true, cities: citiesStore });
}

export async function getStats(req: Request, res: Response) {
  res.json({ success: true, stats: statsStore });
}

export async function updateStats(req: Request, res: Response) {
  statsStore = {
    ...statsStore,
    ...req.body,
    lastUpdated: new Date().toISOString(),
    customOverride: true,
  };
  res.json({ success: true, stats: statsStore });
}

function mapIndianCity(cityName: string, stateName: string = ''): string | null {
  const lowerName = (cityName || '').toLowerCase().trim();
  const lowerState = (stateName || '').toLowerCase().trim();

  if (!lowerName && !lowerState) return null;

  if (lowerName.includes('delhi') || lowerName.includes('new delhi')) {
    return 'Delhi NCR';
  } else if (lowerName.includes('noida') || lowerName.includes('ghaziabad')) {
    return 'Noida';
  } else if (lowerName.includes('gurgaon') || lowerName.includes('gurugram') || lowerName.includes('faridabad')) {
    return 'Gurgaon';
  } else if (lowerName.includes('mumbai') || lowerName.includes('bombay') || lowerName.includes('thane') || lowerName.includes('navi mumbai')) {
    return 'Mumbai';
  } else if (lowerName.includes('bangalore') || lowerName.includes('bengaluru')) {
    return 'Bangalore';
  } else if (lowerName.includes('hyderabad') || lowerName.includes('secunderabad')) {
    return 'Hyderabad';
  } else if (lowerName.includes('pune') || lowerName.includes('pimpri')) {
    return 'Pune';
  } else if (lowerName.includes('jaipur')) {
    return 'Jaipur';
  } else if (lowerName.includes('chandigarh') || lowerName.includes('mohali') || lowerName.includes('panchkula')) {
    return 'Chandigarh';
  } else if (lowerName.includes('lucknow')) {
    return 'Lucknow';
  } else if (lowerName.includes('kolkata') || lowerName.includes('calcutta') || lowerName.includes('howrah')) {
    return 'Kolkata';
  } else if (lowerName.includes('chennai') || lowerName.includes('madras')) {
    return 'Chennai';
  } else if (lowerName.includes('ahmedabad') || lowerName.includes('gandhinagar') || lowerName.includes('surat') || lowerName.includes('vadodara')) {
    return 'Ahmedabad';
  } else if (lowerState.includes('maharashtra')) {
    return 'Mumbai';
  } else if (lowerState.includes('karnataka')) {
    return 'Bangalore';
  } else if (lowerState.includes('delhi')) {
    return 'Delhi NCR';
  } else if (lowerState.includes('rajasthan')) {
    return 'Jaipur';
  } else if (lowerState.includes('tamil nadu')) {
    return 'Chennai';
  } else if (lowerState.includes('west bengal')) {
    return 'Kolkata';
  } else if (lowerState.includes('gujarat')) {
    return 'Ahmedabad';
  }

  // Check direct matching from CITIES_LIST
  const directMatch = CITIES_LIST.find((c) => c.name.toLowerCase().includes(lowerName) || lowerName.includes(c.name.toLowerCase()));
  if (directMatch) {
    return directMatch.name;
  }

  return null;
}

/**
 * Real Live GPS Coordinates & Reverse Geocoding API
 */
export async function detectLocation(req: Request, res: Response) {
  const { lat, lng } = req.query;

  // Case A: Coordinates provided via browser GPS
  if (lat && lng) {
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
      const geoRes = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'thebrandsstory.InfluencerPlatform/1.0' },
      });

      if (geoRes.ok) {
        const geoData: any = await geoRes.json();
        const address = geoData.address || {};
        const detectedCityName = address.city || address.town || address.municipality || address.state_district || address.county || '';
        const detectedState = address.state || '';
        const matchedCity = mapIndianCity(detectedCityName, detectedState);

        return res.json({
          success: !!matchedCity,
          source: 'gps',
          rawCity: detectedCityName,
          rawState: detectedState,
          matchedCity: matchedCity,
          latitude,
          longitude,
        });
      }
    } catch {
      return res.json({
        success: false,
        source: 'gps-error',
        matchedCity: null,
      });
    }
  }

  // Case B: IP-Based Geolocation only if GPS is not supplied
  try {
    const ipRes = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon');
    if (ipRes.ok) {
      const ipData: any = await ipRes.json();
      if (ipData.status === 'success' && ipData.city) {
        const matchedCity = mapIndianCity(ipData.city, ipData.regionName);
        return res.json({
          success: !!matchedCity,
          source: 'ip',
          rawCity: ipData.city,
          rawState: ipData.regionName,
          matchedCity: matchedCity,
          latitude: ipData.lat,
          longitude: ipData.lon,
        });
      }
    }
  } catch {
    // Fallback
  }

  return res.json({
    success: false,
    matchedCity: null,
  });
}
