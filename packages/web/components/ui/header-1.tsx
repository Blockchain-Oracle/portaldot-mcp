'use client';
import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { createPortal } from 'react-dom';

const links = [
	{ label: 'Features', href: '/#features' },
	{ label: 'How it works', href: '/#how' },
	{ label: 'Install', href: '/#install' },
];

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent transition-colors', {
				'border-border bg-background/70 backdrop-blur-lg': scrolled,
			})}
		>
			<nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 rounded-md p-1 text-foreground">
					<DiamondMark className="size-5 text-primary" />
					<span className="font-semibold tracking-tight">portaldot-mcp</span>
				</Link>
				<div className="hidden items-center gap-1 md:flex">
					{links.map((link) => (
						<Link key={link.label} className={buttonVariants({ variant: 'ghost', size: 'sm' })} href={link.href}>
							{link.label}
						</Link>
					))}
					<a
						href="https://github.com/Blockchain-Oracle/portaldot-mcp"
						target="_blank"
						rel="noreferrer"
						className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'ml-1')}
						aria-label="GitHub"
					>
						<GithubGlyph className="size-4" />
					</a>
					<Link href="/app" className={cn(buttonVariants({ size: 'sm' }), 'ml-2')}>
						Open the app
					</Link>
				</div>
				<Button
					size="icon"
					variant="outline"
					onClick={() => setOpen(!open)}
					className="md:hidden"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-2">
				<div className="grid gap-y-1" onClick={() => setOpen(false)}>
					{links.map((link) => (
						<Link
							key={link.label}
							className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
							href={link.href}
						>
							{link.label}
						</Link>
					))}
				</div>
				<div className="flex flex-col gap-2">
					<a
						href="https://github.com/Blockchain-Oracle/portaldot-mcp"
						target="_blank"
						rel="noreferrer"
						className={buttonVariants({ variant: 'outline', className: 'w-full' })}
					>
						GitHub
					</a>
					<Link href="/app" className={cn(buttonVariants(), 'w-full')}>
						Open the app
					</Link>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & { open: boolean };

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;
	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-background/95 supports-[backdrop-filter]:bg-background/70 backdrop-blur-lg',
				'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-border md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn('data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out', 'size-full p-4', className)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

function DiamondMark({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
			<path d="M12 2 22 12 12 22 2 12 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M12 7 17 12 12 17 7 12 12 7Z" fill="currentColor" />
		</svg>
	);
}

function GithubGlyph({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
			<path d="M12 .5C5.7.5.6 5.6.6 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.4 5.6 18.3.5 12 .5Z" />
		</svg>
	);
}
