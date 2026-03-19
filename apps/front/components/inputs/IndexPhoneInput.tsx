import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PhoneIndexes } from "@/data/phone-indexes";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Flag from "react-world-flags";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function IndexPhoneInput({
  onChange,
  disabled,
}: {
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("france");

  const handleOpenChange = (state: boolean) => {
    if (!disabled) {
      setOpen(state);
    }
  };

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? value : currentValue;
    setValue(newValue);
    setOpen(false);
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-auto h-full px-4 py-3 flex shadow-none border hover:bg-white transition text-base ${
            open ? "border-gray-900" : "border-gray-300"
          } ${
            disabled
              ? "bg-gray-100 text-gray-400 hover:text-gray-400 hover:bg-gray-100 cursor-not-allowed"
              : "cursor-pointer"
          }
          }`}
        >
          <div className="w-4 mr-2">
            <Flag
              code={
                PhoneIndexes.find(
                  (phoneIndex) => phoneIndex.name.toLowerCase() === value
                )?.code
              }
              className="rounded-[2px]"
            />
          </div>
          {value
            ? PhoneIndexes.find(
                (phoneIndex) => phoneIndex.name.toLowerCase() === value
              )?.dial_code
            : "Sélectionnez votre pays"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Sélectionnez votre pays" className="h-9" />
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <ScrollArea className="h-72 w-full">
            <CommandGroup>
              {Array.isArray(PhoneIndexes) &&
                PhoneIndexes.map((phoneIndex) => (
                  <CommandItem
                    key={phoneIndex.code}
                    value={phoneIndex.name}
                    onSelect={() => {
                      handleSelect(phoneIndex.name.toLowerCase());
                    }}
                  >
                    <div className="items-center flex">
                      <div className="w-4 mr-2">
                        <Flag
                          code={phoneIndex.code}
                          className="rounded-[2px]"
                        />
                      </div>
                      {phoneIndex.name} ({phoneIndex.dial_code})
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === phoneIndex.name.toLowerCase()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
