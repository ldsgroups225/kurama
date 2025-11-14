import { FaXTwitter, FaGithub } from "react-icons/fa6";

const navigation = {
  main: [
    { name: "À Propos", href: "#" },
    { name: "Fonctionnalités", href: "#features" },
    { name: "Pour les Étudiants", href: "#" },
    { name: "Pour les Enseignants", href: "#" },
  ],
  learn: [
    { name: "BEPC", href: "#" },
    { name: "BAC", href: "#" },
    { name: "Matières", href: "#" },
    { name: "Guide d'Utilisation", href: "#" },
  ],
  social: [
    {
      name: "GitHub",
      href: "https://github.com/your-org/kurama",
      icon: FaGithub,
    },
    {
      name: "X",
      href: "https://x.com/kurama_app",
      icon: FaXTwitter,
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Kurama
            </h3>
            <ul role="list" className="mt-2 space-y-1">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Apprentissage
            </h3>
            <ul role="list" className="mt-2 space-y-1">
              {navigation.learn.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-0 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex space-x-6">
            {navigation.social.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <IconComponent className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              Construit avec ❤️ pour les étudiants en Côte d'Ivoire
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy; {new Date().getFullYear()} Kurama. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
