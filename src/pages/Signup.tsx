import { useState, useEffect } from "react";
import LoginHelpPopup from "@/components/LoginHelpPopup";

const Signup = () => {
  const [showHelpPopup, setShowHelpPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelpPopup(true);
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Existing signup form JSX */}
      <LoginHelpPopup 
        isVisible={showHelpPopup} 
        onClose={() => setShowHelpPopup(false)} 
      />
    </>
  );
};

export default Signup; 