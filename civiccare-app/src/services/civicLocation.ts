import * as Location from 'expo-location';

export interface DetectedCivicLocation {
  civicBody: string;
  shortCity: string;
  suburb: string;
  isPanchayat: boolean;
  latitude: number;
  longitude: number;
}

export const POPULAR_CIVIC_BODIES = [
  'Pune Municipal Corporation (PMC)',
  'Pimpri Chinchwad Municipal Corporation (PCMC)',
  'Brihanmumbai Municipal Corporation (BMC)',
  'Thane Municipal Corporation (TMC)',
  'Navi Mumbai Municipal Corporation (NMMC)',
  'Kalyan-Dombivli Municipal Corporation (KDMC)',
  'Vasai-Virar City Municipal Corporation (VVCMC)',
  'Mira-Bhayandar Municipal Corporation (MBMC)',
  'Palghar Municipal Council',
  'Nashik Municipal Corporation (NMC)',
  'Nagpur Municipal Corporation (NMC)',
  'Chhatrapati Sambhajinagar Municipal Corporation (CSMC)',
  'Gram Panchayat (Rural Area)',
];

/**
 * Extracts a concise city or district name from a full ward/corporation string
 * e.g. "Pune Municipal Corporation (PMC) - Kothrud Ward" -> "Pune"
 *      "Brihanmumbai Municipal Corporation (BMC)" -> "Mumbai"
 *      "Palghar Municipal Council" -> "Palghar"
 */
export function getShortCityName(wardOrCorp?: string | null): string {
  if (!wardOrCorp || wardOrCorp.trim().length === 0) return 'Pune';

  const lower = wardOrCorp.toLowerCase();
  if (lower.includes('pune') || lower.includes('pmc')) return 'Pune';
  if (lower.includes('pimpri') || lower.includes('chinchwad') || lower.includes('pcmc')) return 'Pimpri-Chinchwad';
  if (lower.includes('mumbai') || lower.includes('bmc') || lower.includes('andheri') || lower.includes('colaba')) return 'Mumbai';
  if (lower.includes('thane') || lower.includes('tmc')) return 'Thane';
  if (lower.includes('navi mumbai') || lower.includes('nmmc')) return 'Navi Mumbai';
  if (lower.includes('palghar')) return 'Palghar';
  if (lower.includes('nashik') || lower.includes('nmc')) return 'Nashik';
  if (lower.includes('nagpur')) return 'Nagpur';
  if (lower.includes('kalyan') || lower.includes('dombivli')) return 'Kalyan-Dombivli';
  if (lower.includes('vasai') || lower.includes('virar')) return 'Vasai-Virar';
  if (lower.includes('sambhajinagar') || lower.includes('aurangabad')) return 'Sambhajinagar';
  if (lower.includes('panchayat')) {
    const parts = wardOrCorp.split(' ');
    return parts[0] || 'Gram Panchayat';
  }

  // Fallback: take the first word or segment before hyphen
  const firstPart = wardOrCorp.split('-')[0].trim();
  return firstPart.length > 16 ? firstPart.slice(0, 16) : firstPart;
}

/**
 * Live GPS Reverse-Geocoding into Official Civic Municipal Corporation or Gram Panchayat
 */
export async function detectCivicBodyFromGPS(): Promise<DetectedCivicLocation | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    // OpenStreetMap Nominatim reverse geocoding with detailed address hierarchy
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'CivicCareApp/1.0' } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
    const village = addr.village || addr.hamlet || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || '';
    const district = addr.county || addr.state_district || '';

    // 1. Check if Rural Gram Panchayat (village exists without major city)
    if (village && !addr.city) {
      return {
        civicBody: `${village} Gram Panchayat (${district || 'District'})`,
        shortCity: village,
        suburb: suburb,
        isPanchayat: true,
        latitude: lat,
        longitude: lon,
      };
    }

    const lowerCity = city.toLowerCase();

    // 2. Pune Municipal Corporation (PMC)
    if (lowerCity.includes('pune')) {
      const wardSuffix = suburb ? ` - ${suburb} Ward` : '';
      return {
        civicBody: `Pune Municipal Corporation (PMC)${wardSuffix}`,
        shortCity: 'Pune',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 3. Pimpri-Chinchwad (PCMC)
    if (lowerCity.includes('pimpri') || lowerCity.includes('chinchwad')) {
      const wardSuffix = suburb ? ` - ${suburb} Ward` : '';
      return {
        civicBody: `Pimpri Chinchwad Municipal Corporation (PCMC)${wardSuffix}`,
        shortCity: 'Pimpri-Chinchwad',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 4. Brihanmumbai Municipal Corporation (BMC)
    if (lowerCity.includes('mumbai') || lowerCity.includes('bombay') || suburb.toLowerCase().includes('andheri')) {
      const wardSuffix = suburb ? ` - ${suburb} Ward` : '';
      return {
        civicBody: `Brihanmumbai Municipal Corporation (BMC)${wardSuffix}`,
        shortCity: 'Mumbai',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 5. Thane Municipal Corporation (TMC)
    if (lowerCity.includes('thane')) {
      return {
        civicBody: `Thane Municipal Corporation (TMC)${suburb ? ` - ${suburb}` : ''}`,
        shortCity: 'Thane',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 6. Navi Mumbai Municipal Corporation (NMMC)
    if (lowerCity.includes('navi mumbai')) {
      return {
        civicBody: `Navi Mumbai Municipal Corporation (NMMC)${suburb ? ` - ${suburb}` : ''}`,
        shortCity: 'Navi Mumbai',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 7. Palghar Municipal Council
    if (lowerCity.includes('palghar')) {
      return {
        civicBody: `Palghar Municipal Council`,
        shortCity: 'Palghar',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 8. Nashik Municipal Corporation (NMC)
    if (lowerCity.includes('nashik')) {
      return {
        civicBody: `Nashik Municipal Corporation (NMC)`,
        shortCity: 'Nashik',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 9. Nagpur Municipal Corporation (NMC)
    if (lowerCity.includes('nagpur')) {
      return {
        civicBody: `Nagpur Municipal Corporation (NMC)`,
        shortCity: 'Nagpur',
        suburb,
        isPanchayat: false,
        latitude: lat,
        longitude: lon,
      };
    }

    // 10. Generic / Town Council
    const civicName = city ? `${city} Municipal Council` : (district ? `${district} Civic Authority` : 'Municipal Council');
    return {
      civicBody: suburb ? `${civicName} - ${suburb}` : civicName,
      shortCity: city || 'Local Area',
      suburb,
      isPanchayat: false,
      latitude: lat,
      longitude: lon,
    };
  } catch (err) {
    console.warn('GPS Civic detection failed:', err);
    return null;
  }
}
