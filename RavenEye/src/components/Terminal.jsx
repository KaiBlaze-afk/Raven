import React, { useState, useRef, useEffect } from "react";

const Terminal = ({ Raven, onInputSubmit, clearScreen }) => {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (clearScreen) {
      setInput("");
      setSubmitted(false);
      setHidden(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [clearScreen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        inputRef.current.focus();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setInput(newValue);
    setHidden(newValue.includes("`"));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    const sanitizedInput = input.replace(/`/g, '');
    onInputSubmit(sanitizedInput);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center flex-wrap md:leading-[1.1rem]">
      <span className="text-blue-400 flex-shrink-0">{!Raven && <span>missingSoul</span>}{Raven && <span className="text-red-400">Raven</span>}@nest:~$</span>
      <input
        ref={inputRef}
        spellCheck="false"
        type="text"
        onChange={handleChange}
        disabled={submitted}
        value={input}
        autoFocus
        className={`bg-transparent outline-none flex-grow min-w-0 ml-1 cursor-default ${hidden ? 'text-transparent' : ''}`}
      />
    </form>
  );
};

export default Terminal;
