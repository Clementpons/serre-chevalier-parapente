"use client";

import { Button } from "@/components/ui/button";
import { LoaderIcon, LogoutIcon } from "@/lib/icons";
import { useLogout } from "../api/use-logout";

function LogoutButton() {
  const { mutate: logout, isPending } = useLogout();
  const handleLogout = () => {
    logout();
  };

  return (
    <Button variant={"outline"} disabled={isPending} onClick={handleLogout}>
      {isPending ? (
        <LoaderIcon size={24} className="animate-spin" />
      ) : (
        <LogoutIcon size={24} />
      )}
    </Button>
  );
}

export default LogoutButton;
