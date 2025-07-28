import { useAuth } from "../../context/authContext";

const AvatarMenu = () => {

    const {
        user,
        logout
    } = useAuth();

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="bg-neutral text-neutral-content w-12 h-12 rounded-full flex items-center justify-center uppercase cursor-pointer">
                {user.username.substring(0, 2)}
            </div>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
                <li className="menu-title">Hello, {user.username}!</li>
                <li onClick={logout}><a>Logout</a></li>
            </ul>
        </div>
    );
}

export default AvatarMenu;

