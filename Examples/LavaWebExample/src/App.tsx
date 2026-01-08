import LavaAnimation from "./components/LavaAnimation";

const animations = [
  {
    path: "/animations/m13HomepageExperiencesTabInitialAnimationLavaAssets",
    name: "Experiences Tab",
    description: "Initial animation state",
    width: 180,
    height: 162,
  },
  {
    path: "/animations/m13HomepageExperiencesTabInitialAnimationSelectedLavaAssets",
    name: "Experiences Selected",
    description: "Selected state animation",
    width: 180,
    height: 162,
  },
  {
    path: "/animations/m13HomepageExperiencesTabLavaAssets",
    name: "Experiences Loop",
    description: "Continuous loop animation",
    width: 180,
    height: 162,
  },
  {
    path: "/animations/m13HomepageServicesTabInitialAnimationLavaAssets",
    name: "Services Tab",
    description: "Services initial animation",
    width: 180,
    height: 162,
  },
  {
    path: "/animations/TrophyLavaAssets",
    name: "Trophy Animation",
    description: "Victory celebration loop",
    width: 360,
    height: 360,
  },
];

function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-glow" />
        <h1 className="title">
          Open<span className="title-accent">Lava</span>
        </h1>
        <p className="tagline">
          Open-source implementation of Airbnb's Lava animation format
        </p>
        <a
          href="https://github.com/devitsbeka/OpenLava"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          View on GitHub
        </a>
      </header>

      <main className="gallery">
        <h2 className="gallery-title">Animation Showcase</h2>
        <p className="gallery-subtitle">
          Tile-based animations optimized for high-performance playback
        </p>

        <div className="animation-grid">
          {animations.map((anim, index) => (
            <article
              key={anim.path}
              className="animation-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-glow" />
              <div className="animation-container">
                <LavaAnimation
                  assetPath={anim.path}
                  width={anim.width}
                  height={anim.height}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">{anim.name}</h3>
                <p className="card-description">{anim.description}</p>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>
          Built with <span className="footer-heart">♥</span> using WebGL
        </p>
        <p className="footer-note">
          Media assets from Airbnb, included for demonstration only
        </p>
      </footer>
    </div>
  );
}

export default App;
