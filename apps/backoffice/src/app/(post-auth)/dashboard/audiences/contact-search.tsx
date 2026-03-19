import { useState } from "react";
import { useSearchContacts } from "@/features/audiences/api/use-search-contacts";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SearchIcon, UserAddIcon, LoaderIcon } from "@/lib/icons";

export function ContactSearch({
  onSelect,
}: {
  onSelect: (contact: { name: string; phone: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: contacts, isFetching } = useSearchContacts(query);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <SearchIcon className="mr-2 h-3.5 w-3.5" />
          Rechercher (Client/Stagiaire)
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Nom, email ou téléphone..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isFetching && (
              <div className="py-6 text-center text-sm flex items-center justify-center text-muted-foreground">
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                Recherche...
              </div>
            )}
            {!isFetching && query.length >= 2 && contacts?.length === 0 && (
              <CommandEmpty>Aucun contact trouvé.</CommandEmpty>
            )}
            {!isFetching && (contacts?.length ?? 0) > 0 && (
              <CommandGroup heading="Résultats">
                {contacts.map((c: any) => (
                  <CommandItem
                    key={c.phone}
                    value={c.phone}
                    onSelect={() => {
                      onSelect({ name: c.name, phone: c.phone });
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex flex-col items-start gap-0.5 cursor-pointer"
                  >
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{c.phone}</span>
                      {c.email && <span>• {c.email}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {query.length < 2 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Tapez au moins 2 caractères
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
