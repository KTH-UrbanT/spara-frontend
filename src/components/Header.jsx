import SettingsModal from "./modal/SettingsModal";

const Header = ({ title }) => {
    return <>
        {/* <div className="flex-1 justify-center">
            <div className="text-2xl dark:text-white">{title}</div>
        </div> */}
        <div className="flex items-center justify-between px-2 pb-2 w-full">
            <span>{/* Placeholder */}</span>
            <span className="text-2xl font-bold dark:text-gray-100">{title}</span>
            {/* Modals */}
            <span><SettingsModal /></span>
        </div>
        <div className="divider m-0" />
    </>
}

export default Header;