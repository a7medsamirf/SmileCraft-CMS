import React from 'react';
import { Facebook, Github, Twitter, Instagram } from 'lucide-react';


const SocialMedia = () => {
  const socialLinks = [
    { href: 'https://twitter.com', icon: <Twitter size={15} />, label: 'Twitter' },
    { href: 'https://facebook.com', icon: <Facebook size={15} />, label: 'Facebook' },
    { href: 'https://instagram.com', icon: <Instagram size={15} />, label: 'Instagram' },
    { href: 'https://github.com', icon: <Github size={15} />, label: 'Github' },
  ];

  return (
    <ul className="flex justify-start gap-3 lg:col-span-5 py-4">
             {socialLinks.map((social, index) => (
        <li
          key={index}
          className="flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-blue-800 hover:text-white transition ease-in-out delay-75 duration-300 size-8 text-center  rounded-full "
        >
          <a href={social.href} target="_blank" aria-label={social.label} className=' '>
            {social.icon}
          </a>
        </li>
      ))}
        </ul>
        
      /*   <ul className="social-media style-border py-4 mx-auto flex items-center sm:flex-row flex-col gap-3">
  
        </ul> */
  );
};

export default SocialMedia;
