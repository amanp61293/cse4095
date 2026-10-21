import { Link, NavLink, Outlet } from 'react-router-dom';

export function PageLayout() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="Math Practice home">
            ✦ Math Practice
          </Link>
          <nav aria-label="Main navigation" className="site-nav">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/practice/setup">Practice</NavLink>
            <NavLink to="/statistics">Statistics</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content" className="page-container">
        <Outlet />
      </main>
      <footer className="footer">Keep practicing, one step at a time!</footer>
    </div>
  );
}
