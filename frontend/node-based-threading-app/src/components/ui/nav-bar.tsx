import { Link } from '@tanstack/react-router'

const NavBar = () => {
  return (
    <nav className="p-4 flex justify-center items-center bg-gray-100 shadow-sm">
      <div className="flex gap-4">
        <Link
          to="/"
          className="px-4 py-2 rounded-md transition-colors hover:bg-gray-200 [&.active]:font-bold [&.active]:bg-gray-200"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="px-4 py-2 rounded-md transition-colors hover:bg-gray-200 [&.active]:font-bold [&.active]:bg-gray-200"
        >
          About
        </Link>
      </div>
    </nav>
  )
}

export default NavBar
