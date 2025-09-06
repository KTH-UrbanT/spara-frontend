import React from 'react';

const Button = ({
  text, // Text is optional
  icon, // Icon is optional
  onClick,
  size,
  color = 'bg-secondary dark:bg-primary', // Default background color
  textColor = 'text-white', // Default text color
  borderColor = 'border-transparent', // Default border color
  iconSize = 22,
  props
}) => {
  return (
    <button
      onClick={onClick}
      className={
        //  ${hoverColor} ${focusColor}
        `btn rounded-lg ${!!icon && !text && 'btn-square'} ${color} ${textColor} border-2 ${borderColor} ${size}`
      }
      {...props}
    >
      {/* Render icon if provided */}
      {icon && React.cloneElement(icon, { size: iconSize })}
      {/* Render text if provided */}
      {text && <span className="p-2">{text}</span>}
    </button>
  );
};

export default Button;
