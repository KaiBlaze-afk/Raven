import React, { useState, useEffect, useRef } from "react";

const Online = ({ selectedBotList = [], selectBot, onlineBotList = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initial selection of all bots when onlineBotList changes
  useEffect(() => {
    if (onlineBotList.length > 0) {
      selectBot(onlineBotList);
    }
  }, [onlineBotList, selectBot]);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleOptionClick = (bot) => {
    const isSelected = selectedBotList.includes(bot);

    if (isSelected) {
      selectBot(selectedBotList.filter((selected) => selected !== bot));
    } else {
      selectBot([...selectedBotList, bot]);
    }
  };

  const isOptionSelected = (bot) => selectedBotList.includes(bot);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="fixed top-4 right-4 bg-gray-900 text-green-500 px-4 py-2 font-bold text-sm border-2 border-green-500 rounded-lg focus:outline-none z-50"
        onClick={toggleDropdown}
      >
        {`${onlineBotList.length} Bots`} &nbsp; ▼
      </button>
      {isOpen && (
        <div className="fixed right-0 top-12 mt-2 w-48 bg-gray-900 border-2 border-black-500 rounded-lg shadow-lg z-50">
          {onlineBotList.map((bot, index) => (
            <a
              key={index}
              href="#"
              className={`block px-4 py-2 ${
                isOptionSelected(bot)
                  ? "bg-green-500 text-gray-900"
                  : "text-black-500"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleOptionClick(bot);
              }}
            >
              {bot}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Online;
