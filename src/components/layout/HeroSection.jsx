import Icon from "../common/Icon";

const tiles = [
  {
    image: "T-shirt_vert.jpeg",
    alt: "T-shirt Vert menthe",
    height: "h-64",
    padding: "p-6",
    background: "from-emerald-50 to-teal-50",
    hover: "hover:-rotate-1",
  },
  {
    image: "T-shirt_gris.jpeg",
    alt: "T-shirt Gris",
    height: "h-48",
    padding: "p-4",
    background: "from-gray-100 to-gray-200",
    hover: "hover:rotate-1",
  },
  {
    image: "T-shirt_noir.jpeg",
    alt: "T-shirt Noir",
    height: "h-56",
    padding: "p-6",
    background: "from-gray-800 to-gray-900",
    hover: "hover:rotate-1",
  },
  {
    image: "T-shirt_rouge.jpeg",
    alt: "T-shirt Rouge",
    height: "h-52",
    padding: "p-6",
    background: "from-red-50 to-red-100",
    hover: "hover:-rotate-1",
  },
];

function HeroTile({ tile }) {
  return (
    <div
      className={`bg-gray-100 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 transform ${tile.hover}`}
    >
      <img
        src={`/${tile.image}`}
        alt={tile.alt}
        className={`w-full ${tile.height} object-contain ${tile.padding} bg-gradient-to-br ${tile.background}`}
      />
    </div>
  );
}

export default function HeroSection() {
  return (
    <>
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16"
      >
        <div className="absolute inset-0 stripe-pattern" />
        <div className="absolute top-32 left-10 w-20 h-20 bg-law-red/10 rounded-full blur-2xl float-anim" />
        <div
          className="absolute bottom-20 right-20 w-32 h-32 bg-law-green/10 rounded-full blur-2xl float-anim"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-law-red/20 rounded-full float-anim"
          style={{ animationDelay: "2s" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="slide-in">
            <div className="inline-flex items-center gap-2 bg-law-green/10 border border-law-green/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-law-green rounded-full animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-law-green-dark">
                Nouvelle Collection 2026
              </span>
            </div>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-none tracking-tight mb-2">
              <span className="text-law-red">LAW</span>
              <span className="text-law-green">PIKING</span>
            </h1>
            <p className="text-xl sm:text-2xl font-light text-gray-500 mt-4 mb-8 max-w-lg">
              9 Couleurs. Un seul état d'esprit.
              <br />
              <span className="font-semibold text-gray-800">
                Le style qui te définit.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="#collection"
                className="group inline-flex items-center justify-center gap-3 bg-law-red text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-none hover:bg-law-red-dark transition-all duration-300 shadow-lg shadow-red-200"
              >
                Découvrir la Collection{" "}
                <Icon
                  name="lucide:arrow-down"
                  width={18}
                  className="group-hover:translate-y-1 transition-transform"
                />
              </a>
              <a
                href="#about"
                className="group inline-flex items-center justify-center gap-3 bg-white text-gray-900 font-bold text-sm tracking-widest uppercase px-8 py-4 border-2 border-gray-200 hover:border-law-green hover:text-law-green transition-all duration-300"
              >
                Notre Histoire
              </a>
            </div>
            <div className="flex items-center gap-8 pt-8 border-t border-gray-200">
              <div>
                <p className="font-display text-4xl text-law-red">9</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">
                  Couleurs
                </p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="font-display text-4xl text-law-green">SN</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">
                  Fabriqué
                </p>
              </div>
            </div>
          </div>
          <div
            className="relative slide-in hidden lg:block"
            style={{ animationDelay: ".2s" }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <HeroTile tile={tiles[0]} />
                <HeroTile tile={tiles[1]} />
              </div>
              <div className="space-y-4 pt-8">
                <HeroTile tile={tiles[2]} />
                <HeroTile tile={tiles[3]} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
