import React, { useState } from "react";
import { Heart } from "lucide-react";

function HeartPage() {
    const [isLiked, setIsLiked] = useState(false);
  
    function handleLikeClick() {
      setIsLiked((prev) => !prev);
    }
  
    return (
      <div>
       
        <div 
        onClick={handleLikeClick}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
          {isLiked ? (
            <Heart size={20} fill="#684DFF" stroke="#684DFF" />
          ) : (
            <Heart size={20} stroke="#684DFF" />
          )}
        </div>
      </div>
    );
  }
  
  export default HeartPage;