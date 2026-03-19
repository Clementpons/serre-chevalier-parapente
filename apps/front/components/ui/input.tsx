import React, { useState } from "react";

import {
  Building2Icon,
  CircleAlert,
  EyeIcon,
  EyeOffIcon,
  HelpCircle,
  LockIcon,
  MailIcon,
  TagIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  helperText?: string;
  leadingIcon?: "mail" | "lock" | "siret" | "building";
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, helperText, leadingIcon, error, disabled, ...props },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    function handlePasswordVisibility() {
      setIsPasswordVisible(!isPasswordVisible);
    }

    return (
      <div
        className={cn(
          `
          flex items-center gap-2 border px-4 rounded-lg
          has-[:focus]:border-gray-900 border-gray-300 transition-all duration-150
          ${error ? "border-red-600 outline outline-4 outline-red-600/5 has-[:focus]:outline-red-600/20 has-[:focus]:border-red-600" : ""}
          ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}
        `,
          className
        )}
      >
        {leadingIcon && (
          <div className="text-gray-500 flex items-center">
            {leadingIcon === "mail" && <MailIcon size={20} strokeWidth={1.5} />}
            {leadingIcon === "lock" && <LockIcon size={20} strokeWidth={1.5} />}
            {leadingIcon === "siret" && <TagIcon size={20} strokeWidth={1.5} />}
            {leadingIcon === "building" && (
              <Building2Icon size={20} strokeWidth={1.5} />
            )}
          </div>
        )}
        <input
          type={isPasswordVisible ? "text" : type}
          className={cn(
            "w-full flex items-center outline-none py-3 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        {/* Si ce n'est pas un champ password et qu'il y a une HelperText ou un status d'erreur, on affiche l'icone correspondante */}
        {!(type === "password") && (helperText || error) && (
          <div
            className={cn(
              error ? "text-destructive" : "text-gray-500",
              "flex items-center"
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className={cn(disabled ? "cursor-not-allowed" : "")}
                >
                  {error ? (
                    <CircleAlert size={20} strokeWidth={1.5} />
                  ) : (
                    <HelpCircle size={20} strokeWidth={1.5} />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {error ? <p>{error}</p> : <p>{helperText}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        {/* Si c'est un champ de type password, on affiche l'icône pour masquer/afficher le mot de passe */}
        {type === "password" && (
          <div className="text-gray-500" onClick={handlePasswordVisibility}>
            {isPasswordVisible ? (
              <EyeOffIcon
                size={20}
                strokeWidth={1.5}
                onClick={() => setIsPasswordVisible(false)}
              />
            ) : (
              <EyeIcon
                size={20}
                strokeWidth={1.5}
                onClick={() => setIsPasswordVisible(true)}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };