
export default function Card() {
    return (
      <div className="relative w-64 h-80 bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Corner Ribbon */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-600 rounded-tr-xl transform -translate-x-4 -translate-y-4 rotate-45 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21l-1-1C5.8 15 2 12 2 8a5 5 0 0110 0 5 5 0 0110 0c0 4-3.8 7-9 12l-1 1z"
              />
            </svg>
          </div>
        </div>
  
        {/* Card Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">Card Title</h3>
          <p className="text-gray-600 text-sm mt-2">
            This is a sample card with a corner ribbon and a heart icon.
          </p>
        </div>
      </div>
    );
  }
  