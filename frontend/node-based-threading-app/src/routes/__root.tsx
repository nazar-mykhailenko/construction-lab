import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import NavBar from "../components/ui/nav-bar";

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-full flex-col">
      {/* <NavBar /> */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </div>
  ),
});
