import Image from "next/image";

export default function Home() {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Alexchiuu",
      icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/alex-c-26389239a",
      icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/ccalexisme",
      icon: "M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5zm0 1A3.5 3.5 0 1 1 8.5 12 3.504 3.504 0 0 1 12 8.5zM17 6.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z",
    },
    {
      name: "Email",
      url: "mailto:b14901022@g.ntu.edu.tw",
      icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center px-8 py-16">
        {/* Profile Section */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-block">
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-800">
                <span className="text-5xl font-bold text-gray-700 dark:text-gray-200">AC</span>
              </div>
            </div>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Alex C
          </h1>
          
          <p className="mb-2 text-xl text-gray-600 dark:text-gray-300">
            Student — Electrical & Electronics Engineering
          </p>
          
          <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Aspiring engineer focused on project management and systems design. Currently pursuing a BE in Electrical & Electronics Engineering at National Taiwan University in Taipei.
          </p>
        </div>

        {/* About Section */}
        <div className="mb-10 w-full rounded-2xl bg-white/70 p-8 shadow-lg backdrop-blur-sm dark:bg-gray-800/70">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            About Me
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p>🎓 Bachelor of Engineering — Electrical & Electronics Engineering, National Taiwan University (Sep 2025 — Jun 2029)</p>
            <p>🏫 Taipei Municipal Jianguo High School — High School Diploma, Class of Science (Sep 2022 — Jun 2025)</p>
            <p>🧩 Activities: General organizer of the Science affair in Class of Science</p>
            <p>🛠️ Skills: Chinese, English, Project Management, Engineering</p>
            <p>📍 Taipei, Taipei City, Taiwan</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="w-full">
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">
            Connect With Me
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800"
              >
                <svg
                  className="h-8 w-8 fill-gray-700 transition-colors group-hover:fill-blue-500 dark:fill-gray-300 dark:group-hover:fill-blue-400"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={link.icon} />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Alex C. Built with Next.js & Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}
