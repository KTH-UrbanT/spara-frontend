const Header = ({ title }) => {
    return <>
        {/* <div className="flex-1 justify-center">
            <div className="text-2xl dark:text-white">{title}</div>
        </div> */}
        <div className="flex items-center justify-between p-2">
            <span className="text-2xl font-bold dark:text-gray-100">{title}</span>
        </div>
        <div className="divider m-0" />
    </>
}

export default Header;