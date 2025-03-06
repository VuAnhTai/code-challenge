import React from 'react';

interface DirectionButtonProps {
  onClick: () => void;
}

const DirectionButton: React.FC<DirectionButtonProps> = ({ onClick }) => {
  return (
    <div className="swap-direction-button">
      <button type="button" id="swap-direction" onClick={onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 16H13.5L13.5 10H15.5L15.5 16H17L14.5 19L12 16Z"
            fill="#000000"
          />
          <path
            d="M8 8H9.5L9.5 14H11.5L11.5 8H13L10.5 5L8 8Z"
            fill="#000000"
          />
        </svg>
      </button>
    </div>
  );
};

export default DirectionButton; 