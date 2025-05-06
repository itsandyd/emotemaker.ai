import { FaTwitter, FaDiscord, FaYoutube, FaInstagram } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  // const footerSections = [
  //   {
  //     title: "Product",
  //     links: [
  //       { label: "Features", href: "#features" },
  //       { label: "Pricing", href: "#pricing" },
  //       { label: "Gallery", href: "#gallery" },
  //       { label: "Updates", href: "#" },
  //     ],
  //   },
  //   {
  //     title: "Resources",
  //     links: [
  //       { label: "Blog", href: "#" },
  //       { label: "Tutorials", href: "#" },
  //       { label: "Support", href: "#" },
  //       { label: "Documentation", href: "#" },
  //     ],
  //   },
  //   {
  //     title: "Company",
  //     links: [
  //       { label: "About", href: "#" },
  //       { label: "Careers", href: "#" },
  //       { label: "Contact", href: "#contact" },
  //       { label: "Press Kit", href: "#" },
  //     ],
  //   },
  //   {
  //     title: "Legal",
  //     links: [
  //       { label: "Terms", href: "#" },
  //       { label: "Privacy", href: "#" },
  //       { label: "Cookies", href: "#" },
  //       { label: "Licenses", href: "#" },
  //     ],
  //   },
  // ];

  const socialLinks = [
    // { icon: <FaTwitter />, href: "#", label: "Twitter" },
    { icon: <FaDiscord />, href: "https://discord.gg/tc7TWbnSKc", label: "Discord" },
    // { icon: <FaYoutube />, href: "#", label: "YouTube" },
    { icon: <FaInstagram />, href: "https://www.instagram.com/emotemakerai", label: "Instagram" },
  ];

  return (
    <footer className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <a href="#" className="text-xl font-bold font-heading gradient-text">
              EmoteMaker.ai
            </a>
            <p className="text-sm text-neutral-gray mt-2 max-w-md">
              Create custom emotes for Twitch, Discord communities with custom,
              values-based content creation platforms.
            </p>
          </div>

          <div className="flex space-x-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                aria-label={link.label}
                className="w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center text-neutral-gray hover:bg-primary-purple hover:text-white transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {footerSections.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold mb-4">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-gray hover:text-primary-purple transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div> */}

        <div className="border-t border-neutral-light pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-gray mb-4 md:mb-0">
            © {currentYear} EmoteMaker.ai. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-xs text-neutral-gray hover:text-primary-purple transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-neutral-gray hover:text-primary-purple transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs text-neutral-gray hover:text-primary-purple transition-colors"
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
