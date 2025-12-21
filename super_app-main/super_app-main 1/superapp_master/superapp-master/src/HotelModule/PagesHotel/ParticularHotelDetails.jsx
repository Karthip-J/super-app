import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Heart, Pencil } from "lucide-react"; // Removed Upload icon
import share from "../../Icons/shareicon.svg";
import star from "../../Icons/Star.svg";
import arrowIcon from "../../Icons/backiconhome.svg";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ParticularHotelDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomTabs, setRoomTabs] = useState({});
  const [roomReviewsState, setRoomReviewsState] = useState({});
  const [roomReviewModal, setRoomReviewModal] = useState({ roomId: null, show: false });
  const [roomStarRating, setRoomStarRating] = useState(0);
  const [roomReviewText, setRoomReviewText] = useState("");
  const [roomEditReviewIdx, setRoomEditReviewIdx] = useState(null);
  const [photoUploadModal, setPhotoUploadModal] = useState({ roomId: null, show: false });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});

  const currentUserId = localStorage.getItem("userId") || "currentUser";
  

  const getFullImageUrl = (url) => {
    if (!url) return "/fallback-hotel.jpg";
    if (url.startsWith("http")) return url;
    return API_CONFIG.getUrl(url);
  };

  const handleToggleFavourite = () => {
    let favs = JSON.parse(localStorage.getItem("hotelFavourites") || "[]");
    if (isLiked) {
      favs = favs.filter((h) => h.id !== id);
      setIsLiked(false);
    } else {
      if (hotel) favs.push({ id, name: hotel.name, image: hotel.main_image, location: hotel.address });
      setIsLiked(true);
    }
    localStorage.setItem("hotelFavourites", JSON.stringify(favs));
  };

  const handleShare = async () => {
    if (!hotel) return;
    
    const hotelName = hotel.name || "Hotel";
    const hotelLocation = [hotel.address?.street, hotel.address?.city, hotel.address?.state].filter(Boolean).join(", ");
    const shareText = `Check out this amazing hotel: ${hotelName} in ${hotelLocation} on Super App!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${hotelName} - Super App`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Hotel link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Final fallback: show the URL
        prompt('Copy this link:', shareUrl);
      }
    }
  };

  const fetchHotel = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 'demo-token';
      const response = await axios.get(API_CONFIG.getUrl(`/api/hotels/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const normalizedHotel = {
        ...response.data.data,
        name: response.data.data.name || "Unknown Hotel",
        main_image: response.data.data.main_image || "",
        images: response.data.data.images || [response.data.data.main_image].filter(Boolean),
        address: response.data.data.address || { street: "", city: "", state: "" },
        rating: response.data.data.rating || 0,
        total_reviews: response.data.data.total_reviews || 0,
        description: response.data.data.description || "No description available.",
        amenities: response.data.data.amenities || [],
        check_in_time: response.data.data.check_in_time || "14:00",
        check_out_time: response.data.data.check_out_time || "12:00",
        contact: response.data.data.contact || { phone: "", email: "" },
        policies: response.data.data.policies || { cancellation: "No policies available." },
        rooms: response.data.data.rooms?.map((room) => ({
          ...room,
          name: room.name || "Unknown Room",
          type: room.type || "Standard",
          price_per_night: room.price_per_night || 0,
          description: room.description || "No description available.",
          amenities: room.amenities || [],
          images: room.images || [],
        })) || [],
      };
      setHotel(normalizedHotel);
      setLoading(false);
      const favs = JSON.parse(localStorage.getItem("hotelFavourites") || "[]");
      setIsLiked(favs.some((h) => h.id === id));
    } catch (error) {
      console.error("Error fetching hotel:", error);
      setError("Failed to fetch hotel details");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const storedReviews = JSON.parse(localStorage.getItem("roomReviews") || "{}");
    setRoomReviewsState(storedReviews);
  }, []);

  useEffect(() => {
    localStorage.setItem("roomReviews", JSON.stringify(roomReviewsState));
  }, [roomReviewsState]);

  useEffect(() => {
    if (id) {
      fetchHotel();
    }
  }, [id]);

  const calculateRoomStats = (roomId) => {
    const reviews = roomReviewsState[roomId] || [];
    const totalReviews = reviews.length;
    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;
    return { totalReviews, averageRating };
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handlePhotoUpload = async (e, roomId) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const newImages = selectedFiles.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), ...newImages],
    }));

    setPhotoUploadModal({ roomId: null, show: false });
    setSelectedFiles([]);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!hotel) return <div className="p-4 text-center text-red-600">Hotel not found</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-white shadow-lg px-4 py-3 flex items-center gap-3 border-b border-blue-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-blue-100 transition mr-2 border border-blue-200"
        >
          <img src={arrowIcon} alt="Back" className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-blue-900 truncate">{hotel.name}</h1>
          <p className="text-sm text-blue-600 font-medium truncate flex items-center gap-1 mt-1">
            📍{[hotel.address?.street, hotel.address?.city, hotel.address?.state].filter(Boolean).join(", ")}
          </p>
        </div>
      </header>

      {/* Carousel */}
      <div className="relative">
        <Swiper className="w-full h-60">
          {hotel.main_image && (
            <SwiperSlide>
              <img
                src={getFullImageUrl(hotel.main_image)}
                alt="Main"
                className="w-full h-60 object-cover"
                onError={(e) => {
                  console.error('Failed to load hotel main image:', hotel.main_image);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/placeholder-image.png";
                  e.target.alt = `${hotel.name} - Image not available`;
                }}
              />
            </SwiperSlide>
          )}
          {hotel.images?.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={getFullImageUrl(img)}
                alt={`Hotel ${index}`}
                className="w-full h-60 object-cover"
                onError={(e) => {
                  console.error('Failed to load hotel image:', img);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/placeholder-image.png";
                  e.target.alt = `Hotel ${index} - Image not available`;
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={handleToggleFavourite}
            className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow"
          >
            <Heart size={18} className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"} />
          </button>
          <button className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow">
            <img src={share} alt="Share" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hotel Info */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{hotel.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {[hotel.address?.street, hotel.address?.city, hotel.address?.state].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center"></div>
      </div>

      {/* Rooms */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-3">Available Rooms</h2>
        {hotel.rooms?.length > 0 ? (
          hotel.rooms.map((room, index) => {
            const currentTab = roomTabs[room._id] || "about";
            const roomReviews = roomReviewsState[room._id] || [];
            const { totalReviews, averageRating } = calculateRoomStats(room._id);
            const allImages = [...(room.images || []), ...(uploadedImages[room._id] || [])];
            return (
              <div key={room._id || index} className="border border-gray-200 rounded-lg mb-6 overflow-hidden shadow-sm">
                {allImages?.[0] && (
                  <img
                    src={getFullImageUrl(allImages[0])}
                    alt={`Room ${index}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('Failed to load room image:', allImages[0]);
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "/placeholder-image.png";
                      e.target.alt = `Room ${index} - Image not available`;
                    }}
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                    <div className="bg-blue-50 px-2 py-1 rounded flex items-center gap-2">
                      <span className="text-blue-600 font-bold text-sm">{averageRating}/5</span>
                      <img src={star} alt="star" className="w-3 h-3" />
                      <span className="text-gray-500 text-xs">({totalReviews} reviews)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Type:</strong> {room.type}
                  </p>
                  <p className="text-sm text-blue-600 font-semibold mt-1">
                    ₹{room.price_per_night ? room.price_per_night.toLocaleString("en-IN") : "N/A"} / night
                  </p>
                  {/* Room Tabs */}
                  <div className="flex border-b mb-4 mt-4">
                    {["about", "gallery", "review"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setRoomTabs((tabs) => ({ ...tabs, [room._id]: tab }))}
                        className={`flex-1 py-2 text-center font-medium text-sm ${
                          currentTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  {currentTab === "about" && (
                    <div>
                      <p>{room.description}</p>
                      <ul className="list-disc ml-5 mt-2">
                        {room.amenities?.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {currentTab === "gallery" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Room Gallery</h3> {/* Removed Add Photo button */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {allImages?.length > 0 ? (
                          allImages.map((img, i) => (
                            <img
                              key={i}
                              src={getFullImageUrl(img)}
                              alt={`room-thumb-${i}`}
                              className="w-24 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/fallback-hotel.jpg";
                              }}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No images available.</p>
                        )}
                      </div>
                    </div>
                  )}
                  {currentTab === "review" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Room Reviews</h3>
                        <button
                          onClick={() => {
                            setRoomReviewModal({ roomId: room._id, show: true });
                            setRoomStarRating(0);
                            setRoomReviewText("");
                            setRoomEditReviewIdx(null);
                          }}
                          className="text-blue-600 text-sm font-medium flex items-center"
                        >
                          <Pencil size={14} className="mr-1" />
                          Add Review
                        </button>
                      </div>
                      <div className="space-y-4">
                        {roomReviews.length > 0 ? (
                          roomReviews.map((review, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{review.name}</p>
                                  <div className="flex mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{review.date}</span>
                              </div>
                              <p className="mt-3 text-sm text-gray-700">{review.text}</p>
                              {review.userId === currentUserId && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    className="text-blue-600 text-xs font-medium underline"
                                    onClick={() => {
                                      setRoomEditReviewIdx(idx);
                                      setRoomStarRating(review.rating);
                                      setRoomReviewText(review.text);
                                      setRoomReviewModal({ roomId: room._id, show: true });
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-500 text-xs font-medium underline"
                                    onClick={() => {
                                      setRoomReviewsState((prev) => {
                                        const updatedReviews = {
                                          ...prev,
                                          [room._id]: roomReviews.filter((_, i) => i !== idx),
                                        };
                                        localStorage.setItem("roomReviews", JSON.stringify(updatedReviews));
                                        return updatedReviews;
                                      });
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No reviews yet for this room. Be the first to add one!</p>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                    onClick={() => navigate("/hotel-booking", { state: { hotel, room } })}
                  >
                    BOOK NOW
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No rooms available.</p>
        )}
      </div>

      {/* Room Review Form Modal */}
      {roomReviewModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">{roomEditReviewIdx !== null ? "Edit Room Review" : "Write a Room Review"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const newReview = {
                    name: "You",
                    userId: currentUserId,
                    rating: roomStarRating,
                    text: roomReviewText,
                    date: "Just now",
                  };
                  setRoomReviewsState((prev) => {
                    const roomReviews = prev[roomReviewModal.roomId] || [];
                    let updatedReviews;
                    if (roomEditReviewIdx !== null) {
                      updatedReviews = {
                        ...prev,
                        [roomReviewModal.roomId]: roomReviews.map((r, i) =>
                          i === roomEditReviewIdx ? newReview : r
                        ),
                      };
                    } else {
                      updatedReviews = {
                        ...prev,
                        [roomReviewModal.roomId]: [...roomReviews, newReview],
                      };
                    }
                    localStorage.setItem("roomReviews", JSON.stringify(updatedReviews));
                    return updatedReviews;
                  });
                  setRoomReviewModal({ roomId: null, show: false });
                  setRoomStarRating(0);
                  setRoomReviewText("");
                  setRoomEditReviewIdx(null);
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Rating</label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRoomStarRating(star)}
                        className="text-3xl"
                      >
                        {star <= roomStarRating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    className="w-full border border-gray-300 rounded p-3 text-sm"
                    rows="4"
                    placeholder="Share your experience..."
                    value={roomReviewText}
                    onChange={(e) => setRoomReviewText(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setRoomReviewModal({ roomId: null, show: false })}
                    className="flex-1 border border-gray-300 rounded-lg py-2 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoUploadModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">Upload Room Photos</h2>
              <form onSubmit={(e) => handlePhotoUpload(e, photoUploadModal.roomId)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded p-3 text-sm"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setPhotoUploadModal({ roomId: null, show: false })}
                    className="flex-1 border border-gray-300 rounded-lg py-2 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedFiles.length === 0}
                    className={`flex-1 rounded-lg py-2 font-medium ${
                      selectedFiles.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticularHotelDetails;  