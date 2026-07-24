import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand small" href="/" aria-label="LeadDesk Mini home">
          <span className="brand-mark" aria-hidden="true">
            L
          </span>
          <span>LeadDesk Mini</span>
        </Link>
        <a
          className="training-credit"
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built for Digital Heroes Training Task
        </a>
      </div>
    </footer>
  );
}
