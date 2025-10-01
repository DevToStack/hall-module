import { z } from 'zod';

const bookingSchema = z.object({
    apartment_id: z.preprocess((val) => Number(val), z.number().int().positive('Apartment ID must be positive')),
    check_in: z.preprocess((val) => new Date(val), z.date({ required_error: 'Invalid check-in date' })),
    check_out: z.preprocess((val) => new Date(val), z.date({ required_error: 'Invalid check-out date' })),
    guests: z.preprocess((val) => Number(val), z.number().int().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests allowed')),
    total_amount: z.preprocess((val) => Number(val), z.number().positive('Total amount must be positive')),
    nights: z.preprocess((val) => Number(val), z.number().int().min(1, 'At least 1 night required'))
});

export function validateBookingData(data) {
    try {
        // Validate using Zod
        const parsedData = bookingSchema.parse(data);

        // Additional business logic
        const errors = [];
        const startDay = new Date(parsedData.check_in.getFullYear(), parsedData.check_in.getMonth(), parsedData.check_in.getDate());
        const endDay = new Date(parsedData.check_out.getFullYear(), parsedData.check_out.getMonth(), parsedData.check_out.getDate());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDay < today) errors.push('Start date cannot be in the past');
        if (endDay <= startDay) errors.push('End date must be after start date');

        const maxStay = 90;
        const dayDiff = Math.ceil((endDay - startDay) / (1000 * 3600 * 24));
        if (dayDiff > maxStay) errors.push(`Maximum stay is ${maxStay} days`);
        if (parsedData.nights !== dayDiff) errors.push('Night count does not match date range');
        if (parsedData.total_amount < 0) errors.push('Total amount cannot be negative');

        return {
            isValid: errors.length === 0,
            errors,
            data: parsedData
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                isValid: false,
                errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
            };
        }

        return {
            isValid: false,
            errors: [error.message || 'Invalid booking data format']
        };
    }
}
