import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-[#039994] mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#039994] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#028580] transition-colors focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
