import { NavLink } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import Button from "../Button";
import { useAuth } from "../../context/authContext";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const { sessions } = useAuth();

  return (
    <div className="relative">
      {/* Always show Menu button */}
      {isCollapsed && (
        <div className="fixed left-4 top-4 z-50">
          <Button
            icon={<HiMenu size={24} />}
            color={"btn-neutral"}
            size={"btn-sm"}
            onClick={toggleSidebar}
          />
        </div>
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-800 text-white z-40 transform transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-4">
          <span className="text-2xl font-bold">Spara</span>
          <Button
            icon={<HiMenu size={24} />}
            color={"btn-neutral"}
            size={"btn-sm"}
            onClick={toggleSidebar}
          />
        </div>

        {/* Menu Items */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/"
                className="block px-2 py-1 hover:bg-gray-700 rounded"
              >
                Home
              </NavLink>
            </li>
            {sessions?.length > 0 && (
              <>
                <li className="text-gray-400 text-xs uppercase mt-4">
                  Sessions
                </li>
                {sessions.map((session) => (
                  <li key={session.session_id}>
                    <NavLink
                      to={`/chat/${session.session_id}`}
                      className="block px-2 py-1 hover:bg-gray-700 rounded"
                    >
                      {`Chat ${session.session_id}`}
                    </NavLink>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>

        {/* Footer */}
        {/* <div className="p-4 text-center">
          <button className="text-sm text-gray-400 hover:text-white">
            Logout
          </button>
        </div> */}
      </aside>
    </div>
  );
};

export default Sidebar;
