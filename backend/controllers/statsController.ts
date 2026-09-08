import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { CATEGORIES_LIST, CITIES_LIST, INDUSTRIES_LIST, INITIAL_STATS } from '../data/initialData';
import { PlatformStatsConfig } from '../types';
import { creatorsStore } from './creatorController';

let statsStore: PlatformStatsConfig = { ...INITIAL_STATS };
const categoriesStore = [...CATEGORIES_LIST];
const citiesStore = [...CITIES_LIST];
const industriesStore = [...INDUSTRIES_LIST];

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

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, iconName, image, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const catSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    const catId = catSlug || `cat_${Date.now()}`;
    const icon = iconName || 'Sparkles';
    const img = image || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=80';
    const desc = description || `${name} influencers and content creators`;

    // Try DB Insert
    await dbQuery(
      `INSERT INTO categories (id, name, slug, icon_name, image, description, count)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE name=VALUES(name), icon_name=VALUES(icon_name), image=VALUES(image), description=VALUES(description);`,
      [catId, name.trim(), catSlug, icon, img, desc]
    );

    const newCat = {
      id: catId,
      name: name.trim(),
      slug: catSlug,
      iconName: icon,
      image: img,
      description: desc,
      count: 0
    };

    // Update memory store as fallback
    const existingIdx = categoriesStore.findIndex(c => c.id === catId || c.slug === catSlug);
    if (existingIdx >= 0) {
      categoriesStore[existingIdx] = newCat;
    } else {
      categoriesStore.unshift(newCat);
    }

    res.json({ success: true, category: newCat, message: 'Category created successfully!' });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create category.' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Category ID is required.' });
    }

    await dbQuery('DELETE FROM categories WHERE id = ? OR slug = ?', [id, id]);

    const idx = categoriesStore.findIndex(c => c.id === id || c.slug === id);
    if (idx >= 0) {
      categoriesStore.splice(idx, 1);
    }

    res.json({ success: true, message: 'Category deleted successfully!' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete category.' });
  }
}

export async function getCities(req: Request, res: Response) {
  const dbCities = await dbQuery('SELECT id, name, slug, state, tier, image, count FROM cities ORDER BY count DESC');
  if (dbCities && dbCities.length > 0) {
    return res.json({ success: true, cities: dbCities });
  }
  res.json({ success: true, cities: citiesStore });
}

export async function getIndustries(req: Request, res: Response) {
  try {
    const dbIndustries = await dbQuery('SELECT id, name, slug, icon_name as iconName, description, recommended_categories as recommendedCategories, image FROM industries ORDER BY name ASC');
    if (dbIndustries && dbIndustries.length > 0) {
      const formatted = dbIndustries.map((ind: any) => ({
        ...ind,
        recommendedCategories: typeof ind.recommendedCategories === 'string' ? JSON.parse(ind.recommendedCategories) : (ind.recommendedCategories || [])
      }));
      return res.json({ success: true, industries: formatted });
    }
  } catch (err) {
    console.warn('MySQL getIndustries fallback:', err);
  }
  res.json({ success: true, industries: industriesStore });
}

export async function getStats(req: Request, res: Response) {
  try {
    const dbStats = await dbQuery('SELECT * FROM platform_stats WHERE id = "main_stats" LIMIT 1');
    if (dbStats && dbStats.length > 0) {
      const s = dbStats[0];
      return res.json({
        success: true,
        stats: {
          creatorsDisplay: s.creators_display,
          citiesDisplay: s.cities_display,
          categoriesDisplay: s.categories_display,
          brandConnectionsDisplay: s.brand_connections_display,
          customOverride: Boolean(s.custom_override),
          lastUpdated: s.updated_at || new Date().toISOString(),
        }
      });
    }
  } catch (err) {
    console.warn('MySQL getStats fallback:', err);
  }
  res.json({ success: true, stats: statsStore });
}

export async function updateStats(req: Request, res: Response) {
  statsStore = {
    ...statsStore,
    ...req.body,
    lastUpdated: new Date().toISOString(),
    customOverride: true,
  };
  try {
    await dbQuery(
      `INSERT INTO platform_stats (id, creators_display, cities_display, categories_display, brand_connections_display, custom_override)
       VALUES ('main_stats', ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         creators_display = VALUES(creators_display),
         cities_display = VALUES(cities_display),
         categories_display = VALUES(categories_display),
         brand_connections_display = VALUES(brand_connections_display),
         custom_override = TRUE;`,
      [
        statsStore.creatorsDisplay,
        statsStore.citiesDisplay,
        statsStore.categoriesDisplay,
        statsStore.brandConnectionsDisplay,
      ]
    );
  } catch (err) {
    console.warn('MySQL updateStats notice:', err);
  }
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
