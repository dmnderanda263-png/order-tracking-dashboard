import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Nethu Fashion. All Rights Reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-800">Support</a>
          <a href="#" className="hover:text-gray-800">Terms of Service</a>
          <a href="#" className="hover:text-gray-800">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;