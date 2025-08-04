
import { Suspense } from 'react';
import OtpForm from '@/components/OTPForm'; // or wherever it is

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
            <OtpForm />
        </Suspense>
    );
}
