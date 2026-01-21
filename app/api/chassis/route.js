import { NextResponse } from 'next/server';
import { getChassisRange, getChassisYearsForModel, loadChassisYears } from '@/lib/data-server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    // If no params, return all chassis data structure
    if (!make) {
      const chassisYears = loadChassisYears();
      // Return just makes and models for dropdown
      const summary = {};
      Object.keys(chassisYears).forEach(m => {
        summary[m] = Object.keys(chassisYears[m]).map(model => ({
          model,
          yearStart: chassisYears[m][model].yearStart,
          yearEnd: chassisYears[m][model].yearEnd
        }));
      });
      return NextResponse.json(summary);
    }

    // If make and model, return years for that model
    if (make && model && !year) {
      const modelData = getChassisYearsForModel(make, model);
      if (!modelData) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      return NextResponse.json(modelData);
    }

    // If make, model, and year, return chassis range
    if (make && model && year) {
      const chassisRange = getChassisRange(make, model, parseInt(year));
      if (!chassisRange) {
        return NextResponse.json({ error: 'Year not found for this model' }, { status: 404 });
      }
      return NextResponse.json(chassisRange);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Chassis API error:', error);
    return NextResponse.json({ error: 'Failed to load chassis data' }, { status: 500 });
  }
}
