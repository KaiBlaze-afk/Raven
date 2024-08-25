import React from 'react';

const Header = () => {
  return (
    <div>
    <pre className='hidden md:block md:w-scrren md:leading-[1.1rem] leading-[0.6rem] md:text-[1rem] text-[.5rem]'>
      {`
░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓███████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░
░▒▓███████▓▒░░▒▓████████▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░  ░▒▓██▓▒░  ░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░`}
      <div className='mb-3  md:text-[1rem] text-[.7rem] md:leading-[1.1rem] leading-[0.9rem]'>
      Where Ghost Commands.
      </div>
    </pre>
    <div className='md:hidden block md:w-scrren md:leading-[1.1rem] leading-[0.6rem] md:text-[1rem] text-[.5rem]'>
      <div className='mb-3  md:text-[1rem] text-[.7rem] md:leading-[1.1rem] leading-[0.9rem]'>
      <span className="text-blue-400 flex-shrink-0">Current user:- MissingSoul</span><br/>
      System status: Active    <br/>  Ghost is in the shell.

      </div>
    </div>
    </div>
  );
};

export default Header;
