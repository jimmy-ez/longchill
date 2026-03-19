import Link from "next/link";
import Image from "next/image";
import "./page.css";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <Image
            src="/hero-bg.jpg"
            alt="Longchill ambiance"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content container">
          <div className="hero-text animate-fade-in-up">
            <Image
              src="/logo-white.png"
              alt="Longchill"
              width={280}
              height={100}
              className="hero-logo"
              priority
            />
            <p className="hero-tagline">ลองชิลล์</p>
            <p className="hero-subtitle">
              Where great food meets good vibes
            </p>
            <div className="hero-actions">
              <Link href="/reservation" className="btn btn-primary">
                Reserve a Table
              </Link>
              <Link href="/menu" className="btn btn-secondary">
                View Menu
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content animate-fade-in-up">
              <div className="section-heading" style={{ textAlign: "left" }}>
                <div className="accent-line"></div>
                <h2>Experience the Chill</h2>
              </div>
              <p>
                Longchill is more than just a bar and restaurant — it&apos;s a
                destination. Nestled in a warm, inviting atmosphere with ambient
                neon glow, we offer a curated selection of craft cocktails,
                premium spirits, and dishes that excite the palate.
              </p>
              <p>
                Whether you&apos;re here for a casual evening with friends, a
                romantic dinner, or a late-night cocktail adventure, Longchill
                is where time slows down and the vibes are always right.
              </p>
            </div>
            <div className="about-features stagger-children">
              <div className="feature-card animate-fade-in-up">
                <span className="feature-icon">🍸</span>
                <h4>Craft Cocktails</h4>
                <p>Signature drinks crafted by expert mixologists</p>
              </div>
              <div className="feature-card animate-fade-in-up">
                <span className="feature-icon">🍽️</span>
                <h4>Fine Dining</h4>
                <p>Chef-curated menu with local and international flavors</p>
              </div>
              <div className="feature-card animate-fade-in-up">
                <span className="feature-icon">🎵</span>
                <h4>Live Vibes</h4>
                <p>Curated music and ambient atmosphere every night</p>
              </div>
              <div className="feature-card animate-fade-in-up">
                <span className="feature-icon">🌙</span>
                <h4>Late Night</h4>
                <p>Open until late — the night is always young here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="featured-section">
        <div className="container">
          <div className="section-heading">
            <div className="accent-line"></div>
            <h2>From Our Menu</h2>
            <p>A taste of what awaits you at Longchill</p>
          </div>
          <div className="featured-grid stagger-children">
            <div className="featured-card animate-fade-in-up">
              <div className="featured-card-icon">🥂</div>
              <h3>Longchill Sunset</h3>
              <p className="featured-desc">
                Our house signature — rum, passion fruit, lime, and grenadine
              </p>
              <span className="featured-price">฿259</span>
            </div>
            <div className="featured-card animate-fade-in-up">
              <div className="featured-card-icon">🥩</div>
              <h3>Grilled Ribeye</h3>
              <p className="featured-desc">
                250g premium ribeye with herb butter and seasonal vegetables
              </p>
              <span className="featured-price">฿590</span>
            </div>
            <div className="featured-card animate-fade-in-up">
              <div className="featured-card-icon">🍫</div>
              <h3>Chocolate Lava Cake</h3>
              <p className="featured-desc">
                Warm dark chocolate cake with vanilla ice cream
              </p>
              <span className="featured-price">฿189</span>
            </div>
          </div>
          <div className="featured-cta">
            <Link href="/menu" className="btn btn-secondary">
              See Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* Hours & CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Chill?</h2>
              <p>
                Book your table now and experience the best of food, drinks, and
                atmosphere.
              </p>
              <div className="cta-hours">
                <div className="cta-hour-item">
                  <span className="cta-day">Mon – Thu</span>
                  <span className="cta-time">17:00 – 00:00</span>
                </div>
                <div className="cta-hour-item">
                  <span className="cta-day">Fri – Sat</span>
                  <span className="cta-time">17:00 – 02:00</span>
                </div>
                <div className="cta-hour-item">
                  <span className="cta-day">Sunday</span>
                  <span className="cta-time">17:00 – 23:00</span>
                </div>
              </div>
              <Link href="/reservation" className="btn btn-primary">
                Reserve Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
