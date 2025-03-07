// src/app/page.jsx

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 flex flex-col justify-center items-center text-white">
      <div className="text-center">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold mb-6 animate__animated animate__fadeInUp">
          Welcome to My Next.js App
        </h1>
        
        {/* Subheading */}
        <p className="text-xl max-w-3xl mx-auto mb-8 animate__animated animate__fadeInUp animate__delay-1s">
          This is a simple page styled with Tailwind CSS and enhanced with a vibrant background gradient. The layout is fully responsive and includes modern animations.
        </p>
        
        {/* Call-to-action button */}
        <a href="#features" className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
          Explore Features
        </a>
      </div>
      
      {/* Features Section (hidden initially) */}
      <section id="features" className="mt-16 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">Features</h2>
        <p className="text-lg text-gray-200">
          Explore amazing features that help you create stunning web applications quickly.
        </p>
      </section>
    </div>
  );
}
