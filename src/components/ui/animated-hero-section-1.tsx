import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "./utils";
import { Button } from "./button";
import { Menu, X } from "lucide-react";

interface NavLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface AnimatedHeroProps {
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
  logo: React.ReactNode;
  navLinks: NavLink[];
  topRightAction?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  ctaButton?: {
    text: string;
    onClick: () => void;
  };
  secondaryCta?: {
    text: string;
    onClick: () => void;
  };
  rightContent?: React.ReactNode;
  notice?: React.ReactNode;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const AnimatedHero = ({
  backgroundImageUrl,
  backgroundVideoUrl,
  logo,
  navLinks,
  topRightAction,
  title,
  description,
  ctaButton,
  secondaryCta,
  rightContent,
  notice,
  className,
}: AnimatedHeroProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const glassButtonClassName =
    "bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground hover:bg-white/20 transition-colors";

  const hasRightContent = !!rightContent;

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background",
        className
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {backgroundVideoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLVideoElement).style.display = "none";
            }}
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
        ) : backgroundImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 flex h-16 sm:h-20 w-full items-center justify-between px-4 sm:px-6 md:px-12 text-white flex-shrink-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-2">{logo}</div>

        {/* Desktop nav */}
        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href ?? "#"}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* topRightAction — sempre visível em todos os tamanhos */}
        {topRightAction && (
          <div>{topRightAction}</div>
        )}

        {/* Hambúrguer — só aparece quando há navLinks */}
        {navLinks.length > 0 && (
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
      </motion.header>

      {/* Mobile menu overlay — só quando há navLinks */}
      {mobileMenuOpen && navLinks.length > 0 && (
        <div
          className="fixed inset-0 z-30 bg-black/80 flex flex-col pt-16 px-6 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav className="flex flex-col gap-6 mt-6" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href ?? "#"}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-white border-b border-white/10 pb-4"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-1 w-full items-center">
        {hasRightContent ? (
          /* 2-column layout: title/desc on left, form on right */
          <div className="w-full px-6 md:px-12 py-8">
            <div className="grid lg:grid-cols-2 xl:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center max-w-7xl mx-auto">
              {/* Left: title + description + CTA */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="xl:col-span-6 flex flex-col text-white order-2 lg:order-1 min-w-0"
              >
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]"
                >
                  {title}
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="mt-6 max-w-xl text-lg leading-8 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
                >
                  {description}
                </motion.p>
                {(ctaButton || secondaryCta) && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-8 flex items-center gap-x-4"
                  >
                    {ctaButton && (
                      <Button onClick={ctaButton.onClick} size="lg" className={glassButtonClassName}>
                        {ctaButton.text}
                      </Button>
                    )}
                    {secondaryCta && (
                      <Button onClick={secondaryCta.onClick} size="lg" className={glassButtonClassName}>
                        {secondaryCta.text}
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Right: custom content (form card etc.) */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                className="xl:col-span-5 xl:col-start-8 order-1 lg:order-2 flex justify-center lg:justify-end min-w-0"
              >
                {rightContent}
              </motion.div>
            </div>
          </div>
        ) : (
          /* Single-column layout (original) */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start justify-center text-left px-6 md:px-12 max-w-4xl w-full text-white py-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]"
            >
              {title}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-2xl text-lg leading-8 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]"
            >
              {description}
            </motion.p>
            {(ctaButton || secondaryCta) && (
              <motion.div
                variants={itemVariants}
                className="mt-10 flex items-center gap-x-4"
              >
                {ctaButton && (
                  <Button onClick={ctaButton.onClick} size="lg" className={glassButtonClassName}>
                    {ctaButton.text}
                  </Button>
                )}
                {secondaryCta && (
                  <Button onClick={secondaryCta.onClick} size="lg" className={glassButtonClassName}>
                    {secondaryCta.text}
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Notice strip at the bottom of hero */}
      {notice && (
        <div className="relative z-10 w-full flex-shrink-0">
          {notice}
        </div>
      )}
    </div>
  );
};
