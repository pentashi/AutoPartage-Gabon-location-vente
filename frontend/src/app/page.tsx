"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Car, MapPin, Wrench, KeyRound, ShieldCheck, ArrowRight,
  Menu, X, Gauge, Calendar, CheckCircle2,
} from "lucide-react";

const navLinks = [
  { label: "Véhicules", href: "#fleet" },
  { label: "Comment ça marche", href: "#how" },
  { label: "Avantages", href: "#values" },
];

const values = [
  { icon: MapPin, title: "Suivi GPS 24/7", desc: "Sécurité totale pour votre investissement. Localisation en temps réel et alertes instantanées." },
  { icon: Wrench, title: "Maintenance Incluse", desc: "Gardez l'esprit tranquille. Nous gérons l'entretien, les vidanges et les réparations." },
  { icon: KeyRound, title: "Propriété Finale", desc: "À la fin de votre contrat, le véhicule est à vous. 100% à votre nom, sans surprise." },
];

const fleet = [
  { name: "Toyota Corolla", year: "2021", img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1000&auto=format&fit=crop", price: "250 000", duration: "36 mois", km: "Illimité" },
  { name: "Hyundai Elantra", year: "2022", img: "https://images.unsplash.com/photo-1617634629437-024c0840b3c6?q=80&w=1000&auto=format&fit=crop", price: "285 000", duration: "36 mois", km: "Illimité" },
  { name: "Kia Rio", year: "2021", img: "https://images.unsplash.com/photo-1594957676757-cfb5266184a4?q=80&w=1000&auto=format&fit=crop", price: "220 000", duration: "36 mois", km: "Illimité" },
];

const steps = [
  { n: "01", title: "Choisissez votre véhicule", desc: "Parcourez notre parc et sélectionnez le modèle adapté à votre activité." },
  { n: "02", title: "Signez votre contrat", desc: "Mensualités fixes, conditions claires. Dossier traité en 72h." },
  { n: "03", title: "Roulez & remboursez", desc: "Travaillez en toute sérénité, le GPS et la maintenance sont inclus." },
  { n: "04", title: "Devenez propriétaire", desc: "Dernière mensualité payée : le véhicule vous appartient." },
];

export default function LandingPage() {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-emerald)] shadow-[var(--shadow-emerald)]">
              <Car className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              AutoPartage <span className="text-emerald">Gabon</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-emerald)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-emerald)] transition hover:opacity-90"
            >
              Devenir Chauffeur
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button onClick={() => setMenu(!menu)} className="rounded-lg p-2 text-foreground md:hidden" aria-label="Menu">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menu && (
          <div className="border-t border-border/60 bg-background md:hidden">
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <Link href="/login" className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium">Se connecter</Link>
                <Link href="/signup" className="rounded-lg bg-[image:var(--gradient-emerald)] px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Devenir Chauffeur</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,oklch(0.68_0.16_152/0.15),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald">
              <ShieldCheck className="h-3.5 w-3.5" />
              Plateforme certifiée — Libreville · Port-Gentil
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Propulsez votre avenir :<br />
              <span className="bg-[image:var(--gradient-emerald)] bg-clip-text text-transparent">
                Devenez propriétaire
              </span>{" "}
              de votre outil de travail.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              La première plateforme de <strong className="text-foreground">Location-Vente</strong> au Gabon dédiée aux chauffeurs professionnels.
              Roulez aujourd'hui, possédez demain — sans apport bancaire.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-emerald)] px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-emerald)] transition hover:opacity-90"
              >
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#fleet"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Voir le parc
              </a>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { v: "200+", l: "Chauffeurs actifs" },
                { v: "36 mois", l: "Durée moyenne" },
                { v: "100%", l: "Véhicules suivis GPS" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-2xl font-bold tracking-tight text-foreground">{s.v}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[image:var(--gradient-emerald)] opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
              <img src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1600&auto=format&fit=crop" alt="Véhicule AutoPartage à Libreville" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-border/50 bg-slate-deep/80 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald/20">
                    <Gauge className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Tableau de bord chauffeur</div>
                    <div className="text-sm font-semibold">Mensualité couverte · J+12</div>
                  </div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section id="values" className="border-y border-border bg-slate-deep py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald">Pourquoi AutoPartage</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Une infrastructure pensée pour les professionnels du transport.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition hover:border-emerald/40">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[image:var(--gradient-emerald)] shadow-[var(--shadow-emerald)]">
                  <v.icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.25} />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-emerald/5 blur-2xl transition group-hover:bg-emerald/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald">Comment ça marche</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              De la signature aux clés : 4 étapes simples.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="bg-card p-6">
                <div className="text-sm font-bold text-emerald">{s.n}</div>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" className="border-t border-border bg-slate-deep py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald">Notre parc</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Des véhicules fiables, prêts à rouler.
              </h2>
            </div>
            <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-emerald hover:text-emerald-glow">
              Voir tout le parc <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fleet.map((c) => (
              <article key={c.name} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-emerald/40 hover:shadow-[var(--shadow-card)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-elevated">
                  <img src={c.img} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute right-3 top-3 rounded-full border border-emerald/30 bg-slate-deep/80 px-3 py-1 text-xs font-medium text-emerald backdrop-blur">
                    Disponible
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">Berline · {c.year}</p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-emerald" />
                  </div>

                  <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{c.duration}</div>
                    <div className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" />{c.km}</div>
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">À partir de</div>
                      <div className="text-2xl font-bold tracking-tight">
                        {c.price} <span className="text-sm font-medium text-muted-foreground">FCFA / mois</span>
                      </div>
                    </div>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-emerald-glow"
                    >
                      Choisir
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-emerald/30 bg-card p-10 sm:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.68_0.16_152/0.25),transparent_60%)]" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Prêt à rouler pour vous-même ?</h2>
                <p className="mt-2 text-muted-foreground">Dossier traité en 72h. Pas de banque, pas de garant.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-emerald)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-emerald)]">
                  S'inscrire <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="rounded-lg border border-border bg-secondary/50 px-6 py-3 text-sm font-semibold hover:bg-secondary">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-slate-deep">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-emerald)]">
                  <Car className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold tracking-tight">AutoPartage <span className="text-emerald">Gabon</span></span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                La plateforme de référence pour la location-vente automobile au Gabon. Roulez aujourd'hui, possédez demain.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Plateforme</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#fleet" className="hover:text-foreground">Véhicules</a></li>
                <li><a href="#how" className="hover:text-foreground">Comment ça marche</a></li>
                <li><a href="#values" className="hover:text-foreground">Avantages</a></li>
                <li><Link href="/signup" className="hover:text-foreground">Devenir chauffeur</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Accès</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground">Se connecter</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">S'inscrire</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AutoPartage Gabon. Tous droits réservés.</p>
            <p className="text-xs text-muted-foreground">Libreville · Port-Gentil · Franceville</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
