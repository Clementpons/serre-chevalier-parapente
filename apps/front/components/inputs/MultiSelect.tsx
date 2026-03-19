import React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { ChevronsDownUpIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn function
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";

interface MultiSelectProps {
  options: string[];
  selectedOptions: string[];
  placeholder: string;
  menuLabel: string;
  onChange: (selected: string[]) => void;
  className?: string; // Add className prop
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedOptions,
  placeholder,
  menuLabel,
  onChange,
  className, // Destructure className prop
}) => {
  const handleOptionClick = (option: string) => {
    if (option === "Vider le filtre") {
      onChange([]);
    } else if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((selected) => selected !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <div className="relative w-full">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "border border-gray-300 rounded-md py-3 px-4 pr-12 cursor-pointer flex items-center justify-between gap-2 text-slate-900/50 w-full relative",
            className // Combine default classes with className prop
          )}>
          <div>
            {selectedOptions && selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge key={option} className="mr-1">
                  {option}
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsDownUpIcon className="size-4 text-slate-900/50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[50svw]">
          <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            key="Vider le filtre"
            checked={selectedOptions.length === 0}
            className="font-bold"
            onCheckedChange={() => handleOptionClick("Vider le filtre")}>
            Vider le filtre
          </DropdownMenuCheckboxItem>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selectedOptions.includes(option)}
              onCheckedChange={() => handleOptionClick(option)}>
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={"icon"}
              disabled={selectedOptions.length === 0}
              onClick={(e) => {
                e.stopPropagation();
                handleOptionClick("Vider le filtre");
              }}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-sm">
              <XIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vider le filtre</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MultiSelect;
