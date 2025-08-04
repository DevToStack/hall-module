import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingCalendar({ formData, setFormData, disabledRanges }) {
    const [calendarDisabled, setCalendarDisabled] = useState(false);

    const handleSelect = (range) => {
        if (!range?.from || !range?.to) return;

        const toDateStr = (date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - offset * 60 * 1000);
            return localDate.toISOString().split('T')[0];
        };

        setFormData((prev) => ({
            ...prev,
            checkin: toDateStr(range.from),
            checkout: toDateStr(range.to),
        }));
    };

    const handleDoubleClick = () => {
        setCalendarDisabled(true);
        setFormData((prev) => ({
            ...prev,
            checkin: '',
            checkout: '',
        }));
    };

    return (
        <div
            className={`border rounded-xl p-4 ml-auto mr-auto ${calendarDisabled ? 'pointer-events-none cursor-default opacity-60' : ''}`}
        >
            <DayPicker
                mode="range"
                selected={
                    formData.checkin && formData.checkout
                        ? {
                            from: new Date(formData.checkin),
                            to: new Date(formData.checkout),
                        }
                        : undefined
                }
                onSelect={handleSelect}
                disabled={disabledRanges}
                modifiersClassNames={{
                    disabled: 'bg-blue-200 text-gray-800',
                    selected: 'bg-blue-100 text-blue-900 ',
                    range_start: 'bg-blue-600 text-white rounded-tl-full rounded-bl-full',
                    range_end: 'bg-blue-600 text-white rounded-tr-full rounded-br-full',
                }}
                numberOfMonths={1}
                className="mx-auto"
            />
        </div>
    );
}
