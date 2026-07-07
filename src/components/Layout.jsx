import { Outlet, NavLink } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}