import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenMeteoForecast } from '@/lib/weather';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');

    const lat = latParam ? parseFloat(latParam) : 43.3015;
    const lon = lonParam ? parseFloat(lonParam) : 68.2723;

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid latitude or longitude coordinates' }, { status: 400 });
    }

    const result = await fetchOpenMeteoForecast(lat, lon);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Weather route error:', error);
    return NextResponse.json({ error: 'Failed to retrieve weather data' }, { status: 500 });
  }
}
