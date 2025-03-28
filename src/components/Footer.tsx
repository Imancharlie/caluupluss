import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Instagram, 
  Linkedin, 
  Calculator,
  Facebook,
  Twitter
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-caluu-blue-dark border-t border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Calculator Button */}
        

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href="https://www.instagram.com/its_imancharlie"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white transition-colors bg-pink-500/20 hover:bg-pink-500/30 rounded-full"
          >
            <Instagram className="w-5 h-5" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href="https://www.linkedin.com/in/emmanuel-charles"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white transition-colors bg-blue-600/20 hover:bg-blue-600/30 rounded-full"
          >
            <Linkedin className="w-5 h-5" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href="https://www.facebook.com/kodinsoftwares"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white transition-colors bg-blue-500/20 hover:bg-blue-500/30 rounded-full"
          >
            <Facebook className="w-5 h-5" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href="https://twitter.com/kodinsoftwares"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white transition-colors bg-blue-400/20 hover:bg-blue-400/30 rounded-full"
          >
            <Twitter className="w-5 h-5" />
          </motion.a>
        </div>

        {/* Copyright */}
        <div className="text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Kodin Softwares. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 