module.exports = async function (context, req) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
        return;
    }

    try {
        const { location, startDate, endDate, mealType = 'full' } = req.body;

        if (!location || !startDate || !endDate) {
            context.res = {
                status: 400,
                body: { error: "Missing required parameters: location, startDate, endDate" }
            };
            return;
        }

        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Mock per diem calculation - in production, this would fetch from cache/storage
        const baseRate = getBaseRateForLocation(location);
        const mealMultiplier = mealType === 'full' ? 1.0 : 0.75; // Reduced rate for partial meals
        
        const dailyRate = baseRate * mealMultiplier;
        const totalAmount = dailyRate * diffDays;

        const result = {
            location: location,
            startDate: startDate,
            endDate: endDate,
            days: diffDays,
            dailyRate: dailyRate,
            totalAmount: totalAmount,
            currency: 'USD',
            mealType: mealType,
            calculatedAt: new Date().toISOString()
        };

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: result
        };

    } catch (error) {
        context.log.error('Error calculating per diem:', error);
        context.res = {
            status: 500,
            body: { error: "Failed to calculate per diem" }
        };
    }
};

// Mock function to get base rate - in production, this would query storage
function getBaseRateForLocation(location) {
    const rates = {
        'Washington, DC': 65,
        'New York, NY': 71,
        'London, UK': 85,
        'Paris, France': 89,
        'Tokyo, Japan': 95,
        'default': 55
    };
    
    return rates[location] || rates['default'];
}