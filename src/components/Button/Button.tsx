import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline-secondary';
  // Можно добавить другие пропсы, например, fullWidth, icon, etc.
}

const Button = ({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
