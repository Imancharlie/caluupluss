import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/kodinsoftwares',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/kodinsoftwares',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/kodinsoftwares',
      color: 'hover:text-pink-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/company/kodinsoftwares',
      color: 'hover:text-blue-700'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://youtube.com/@kodinsoftwares',
      color: 'hover:text-red-600'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Media & Copyright */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Media */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-lg text-gray-400 transition-colors ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© {currentYear}All rights reserved.</span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-500" /> by KodinSoftwares
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
