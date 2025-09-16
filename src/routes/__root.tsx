import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from '@/providers/theme-provider.tsx';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: () => {

    return (
      <>
        <ThemeProvider defaultTheme="system">
          <Outlet/>
          <Toaster richColors/>
          {/*<TanstackDevtools*/}
          {/*  config={{ position: 'bottom-left' }}*/}
          {/*  plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel/> }]}*/}
          {/*/>*/}
        </ThemeProvider>
      </>
    );
  }
});
