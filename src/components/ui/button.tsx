"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import styles from "./Button.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  showIcon?: boolean;
  variant?: "primary" | "destructive";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ text = "Button", children, className = "", showIcon = true, variant = "primary", ...props }, ref) => {
    const labelText = text || (typeof children === "string" ? children : "Button");
    const variantClass = variant === "destructive" ? styles.destructive : "";

    return (
      <button
        ref={ref}
        className={`${styles.button} ${variantClass} ${className}`}
        {...props}
      >
        <span className={styles.initialText}>{children || labelText}</span>
        <div className={styles.hoverContent}>
          <span>{children || labelText}</span>
          {showIcon && <ArrowRight size={16} />}
        </div>
        <div className={styles.backgroundElement}></div>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { Button };
