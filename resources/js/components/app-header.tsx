import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bolt, CalendarRange, Car, Droplets, Eye, Fuel, History, Menu, ReceiptText, SquareUserRound, UserStar } from 'lucide-react';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const currentUrl = page.url;
    const isDashboard = page.component === 'Dashboard';

    const matchFichaTecnica = currentUrl.match(/^\/fichaTecnica\/([^/]+)/);
    const placaActual = matchFichaTecnica ? matchFichaTecnica[1] : null;
    const isAdmin = auth.user?.roles?.some((role: { name: string }) => role.name === 'admin');
    const vehiculoNavItems: NavItem[] = placaActual
        ? [
            { title: 'Ficha Técnica', href: `/fichaTecnica/${placaActual}`, icon: Car },
            { title: 'Revisión de Fluidos', href: `/fichaTecnica/${placaActual}/revisionFluidos`, icon: Droplets },
            { title: 'Revisión Semanal', href: `/fichaTecnica/${placaActual}/revisionSemanal`, icon: CalendarRange },
            { title: 'Observaciones', href: `/fichaTecnica/${placaActual}/observaciones`, icon: Eye },
            { title: 'Facturas', href: `/fichaTecnica/${placaActual}/facturas`, icon: ReceiptText },
            ...(isAdmin ? [{ title: 'Gasolina', href: `/fichaTecnica/${placaActual}/gasolina`, icon: Fuel }] : []),
            { title: 'Asignaciones', href: `/fichaTecnica/${placaActual}/asignaciones`, icon: History },
            { title: 'Envíos', href: `/fichaTecnica/${placaActual}/envios`, icon: Bolt },
        ]
        : [];

    const getHeaderTitle = () => {
        if (isDashboard) return 'Control de Vehículos';
        if (placaActual) return 'Dashboard';
        return 'Control de Vehículos';
    };

    return (
        <>
            <div className="border-b border-sidebar-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                    {/* Mobile & Tablet Menu */}
                    <div className="flex w-full items-center justify-between lg:hidden">
                        <div className="flex items-center">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="flex h-full w-64 flex-col justify-between bg-sidebar">
                                    <SheetHeader className="p-4 text-left">
                                        <SheetTitle>Control de Vehículos</SheetTitle>
                                        <SheetDescription className="sr-only">Menú de navegación principal y opciones de usuario.</SheetDescription>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                                        {!isDashboard && vehiculoNavItems.length > 0 && (
                                            <div className="flex flex-col space-y-2">
                                                {vehiculoNavItems.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-gray-300 p-4 dark:border-gray-700">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="flex w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium"
                                                >
                                                    <Avatar className="size-6 overflow-hidden rounded-full">
                                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                            {getInitials(auth.user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-gray-800 dark:text-white">{auth.user.name}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-full" align="start">
                                                <UserMenuContent user={auth.user} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Link href="/dashboard" prefetch className="flex items-center gap-2">
                                <h2 className="text-md font-bold tracking-tight text-gray-800 dark:text-white">Control de Vehículos</h2>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            {auth.user.is_admin && (
                                <Link href="/supervision" prefetch>
                                    <UserStar className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Link>
                            )}
                            {auth.user.is_admin && (
                                <Link href="/observaciones" prefetch>
                                    <Eye className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Link>
                            )}
                            {auth.user.is_admin && (
                                <Link href="/perfiles" prefetch>
                                    <SquareUserRound className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Link>
                            )}

                            {/* {auth.user.is_admin && (
                                <Link href="/notificaciones" prefetch>
                                    <Bell className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Link>
                            )} */}
                        </div>
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden w-full items-center justify-between lg:flex">
                        <Link href="/dashboard" prefetch className="flex items-center">
                            <h2 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white">{getHeaderTitle()}</h2>
                        </Link>
                        <div className="flex flex-1 justify-center">
                            {!isDashboard && (
                                <NavigationMenu>
                                    <NavigationMenuList className="flex items-center gap-4">
                                        {vehiculoNavItems.map((item, index) => (
                                            <NavigationMenuItem key={index}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        'flex h-10 items-center rounded-lg px-4 transition-colors duration-200 hover:bg-[#3d9641] dark:hover:bg-gray-800',
                                                        page.url === item.href
                                                            ? 'bg-[#49af4e] font-semibold text-white dark:bg-gray-700 dark:text-gray-50'
                                                            : 'text-gray-600 dark:text-gray-400',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="mr-1 h-5 w-5" />}
                                                    {item.title}
                                                </Link>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            )}
                        </div>
                        <div className="flex items-center space-x-6">
                            {auth.user.is_admin && (
                                <Link href="/supervision" prefetch>
                                    <UserStar className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Link>
                            )}
                            {auth.user.is_admin && (
                                <Link href="/observaciones" prefetch>
                                    <Eye className="h-6 w-6 text-gray-800 dark:text-white" />
                                </Link>
                            )}
                            {auth.user.is_admin && (
                                <Link href="/perfiles" prefetch className="flex items-center justify-start">
                                    <SquareUserRound />
                                </Link>
                            )}
                            {/* {auth.user.is_admin && (
                                <Link href="/notificaciones" prefetch className="flex items-center justify-start">
                                    <Bell />
                                </Link>
                            )} */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="center">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
            {!isDashboard && breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
