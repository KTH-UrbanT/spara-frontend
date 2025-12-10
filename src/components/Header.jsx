import SettingsModal from "./modal/SettingsModal";

const Header = ({ title }) => {
    return <>
        <div className="flex items-center justify-between px-2 pb-2 w-full">
            <div className="text-center w-full">
                <span className="text-2xl font-bold dark:text-gray-100">{title}</span>
            </div>
            <SettingsModal />
        </div>
        <div className="divider m-0" />
    </>
}

export default Header;