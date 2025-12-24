import Link from 'next/link';

export default function SalonSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Aboard!</h1>
                <p className="text-gray-600 mb-8">
                    Your salon listing has been successfully upgraded. Our team will review your details and you&apos;ll see your featured listing live within 24 hours.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/for-salons"
                        className="block w-full bg-[#ee2b8c] text-white font-bold py-3 rounded-xl hover:bg-[#ee2b8c]/90 transition-all"
                    >
                        Back to For Salons
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-white text-gray-700 font-semibold py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
