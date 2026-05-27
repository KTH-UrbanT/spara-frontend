import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HiDownload,
  HiMenu,
  HiOutlineInformationCircle,
  HiOutlineUserCircle,
  HiLogout,
  HiOutlineLogin,
  HiOutlineUserAdd,
} from "react-icons/hi";
import Button from "../Button";
import { useAuth } from "../../context/authContext";
import LogoutModal from "../modal/LogoutModal";
import { downloadEvaluationRecords } from "../../services/api";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Pull sessions + user + logout from your auth context
  const { sessions, showToast, user } = useAuth();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleDownloadEvaluation = async () => {
    try {
      await downloadEvaluationRecords({ format: "csv" });
    } catch (error) {
      console.error("Failed to export evaluation records:", error);
      showToast("Failed to export evaluation records", "error");
    }
  };

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
        flex flex-col`}
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
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/"
                onClick={() => setIsCollapsed(true)}
                className="block px-2 py-1 hover:bg-gray-700 rounded"
              >
                New Chat
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                onClick={() => setIsCollapsed(true)}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-700"
              >
                <HiOutlineInformationCircle aria-hidden="true" size={18} />
                About
              </NavLink>
            </li>
            {sessions?.length > 0 && (
              <>
                <li className="text-gray-400 text-xs uppercase mt-4">
                  Sessions
                </li>
                {sessions
                  .sort((a, b) => b.last_accessed - a.last_accessed) // Sort by last_accessed descending
                  .map((session) => (
                    <li key={session.session_token}>
                      <NavLink
                        to={`/chat/${encodeURIComponent(session.session_token)}`}
                        onClick={() => setIsCollapsed(true)}
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

        {/* User Section */}
        <div className="p-3 border-t border-gray-700 relative">
          <div className="dropdown dropdown-top w-full">

            <Button
              icon={<HiOutlineUserCircle />}
              text={
                <span className="flex w-full items-center justify-between">
                  <span className="truncate">{user?.username || "Account"}</span>
                </span>
              }
              size="btn-sm w-full justify-start gap-3"
              color="bg-gray-700 hover:bg-gray-600"
              textColor="text-white"
              iconSize={18}
            />

            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 text-base-content rounded-box z-50 w-60 p-2 shadow-md border border-base-300"
            >
              <li className="menu-title px-2 py-1 text-s text-base-content/60">Account</li>
              {
                !!user?.temporary_user && user.temporary_user ? (
                  <>
                    <li className="p-1">
                      <Button
                        text="Register"
                        icon={<HiOutlineUserAdd />}
                        onClick={() => navigate('/register')}
                        color="bg-transparent hover:bg-base-300"
                        textColor="text-base-content"
                        size="w-full justify-start"
                        iconSize={16}
                      />
                    </li>
                    <li className="p-1">
                      <Button
                        text="Login"
                        icon={<HiOutlineLogin />}
                        onClick={() => navigate('/login')}
                        color="bg-transparent hover:bg-base-300"
                        textColor="text-base-content"
                        size="w-full justify-start"
                        iconSize={16}
                      />
                    </li>
                  </>
                ) : (
                  <>
                    <li className="p-1">
                      <Button
                        text="Export evaluation CSV"
                        icon={<HiDownload />}
                        onClick={handleDownloadEvaluation}
                        color="bg-transparent hover:bg-base-300"
                        textColor="text-base-content"
                        size="w-full justify-start"
                        iconSize={16}
                      />
                    </li>
                    <li className="p-1">
                      <Button
                        text="Logout"
                        icon={<HiLogout />}
                        onClick={() => setLogoutModalOpen(true)}
                        color="bg-transparent hover:bg-base-300"
                        textColor="text-base-content"
                        size="w-full justify-start"
                        iconSize={16}
                      />
                    </li>
                  </>
                )
              }
            </ul>
          </div>
        </div>
      </aside >

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div >


  );
};

export default Sidebar;
