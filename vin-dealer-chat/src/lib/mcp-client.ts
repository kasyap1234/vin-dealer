/**
 * Direct NHTSA API client - bypasses MCP server for reliability.
 * The MCP server was essentially a proxy for this same API.
 */
export async function callMCPTool(vin: string) {
    try {
        console.log('[VIN] Fetching data for VIN:', vin);

        // Call NHTSA DecodeVinValues API directly
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`NHTSA API error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.Results?.[0];

        if (!results) {
            throw new Error('No results from NHTSA API');
        }

        // Check for errors in the response
        if (results.ErrorCode && results.ErrorCode !== '0') {
            return `VIN decode warning: ${results.ErrorText || 'Unknown error'}`;
        }

        // Format the response as structured vehicle specs
        const vehicleSpecs = {
            vin: vin,
            year: parseInt(results.ModelYear) || null,
            make: results.Make || '',
            model: results.Model || '',
            trim: results.Trim || '',
            series: results.Series || '',
            body_class: results.BodyClass || '',
            vehicle_type: results.VehicleType || '',
            drive_type: results.DriveType || '',
            transmission: results.TransmissionStyle || '',
            engine: {
                cylinders: results.EngineCylinders || '',
                displacement_l: results.DisplacementL || '',
                configuration: results.EngineConfiguration || '',
                fuel_type: results.FuelTypePrimary || '',
                horsepower: results.EngineHP || ''
            },
            manufacturer: results.Manufacturer || '',
            plant_country: results.PlantCountry || ''
        };

        console.log('[VIN] Successfully decoded:', vehicleSpecs.year, vehicleSpecs.make, vehicleSpecs.model);
        return JSON.stringify(vehicleSpecs, null, 2);

    } catch (error) {
        console.error('[VIN] Error:', error);
        return `Error decoding VIN: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
