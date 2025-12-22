import L from 'leaflet';

export const createBikeIcon = () => {
  // Create a simple div for the bike marker
  const bikeIcon = L.divIcon({
    className: 'bike-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: #3b82f6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="white" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 20.5C6.65685 20.5 8 19.1569 8 17.5C8 15.8431 6.65685 14.5 5 14.5C3.34315 14.5 2 15.8431 2 17.5C2 19.1569 3.34315 20.5 5 20.5Z" />
          <path d="M19 20.5C20.6569 20.5 22 19.1569 22 17.5C22 15.8431 20.6569 14.5 19 14.5C17.3431 14.5 16 15.8431 16 17.5C16 19.1569 17.3431 20.5 19 20.5Z" />
          <path d="M18 11H16.5L13.5 4H10V6H12.5L13.6 8.5L11.5 9.5C10.3 8.7 8.8 8.5 8 8.5C5.2 8.5 3 10.4 3 12.5V13.5H5V12.5C5 11.7 6 10.5 8 10.5C8.9 10.5 10.3 10.8 11.4 11.5L17 8.6L16.1 5H18V11Z" />
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  return bikeIcon;
};

// Add some global styles for the bike marker
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .bike-marker {
      transition: transform 0.2s;
    }
    .bike-marker:hover {
      transform: scale(1.2);
    }
  `;
  document.head.appendChild(style);
}
