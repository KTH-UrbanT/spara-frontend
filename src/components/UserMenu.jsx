/**
 * User Menu
 * 
 * This element is meant to hold user related menu options,
 * and be displayed in the top right corner of the screen.
 * It will take children as props, such as modal buttons for
 * profile and settings.
 */
const UserMenu = ({ children }) => {
    return (
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-x-1">
            {children}
        </div>
    );
}

export default UserMenu;

