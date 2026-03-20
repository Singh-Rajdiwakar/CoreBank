import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import hero from '../assets/hero.png'
import { Button } from '../components/ui/Button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="absolute inset-0 grid-fade bg-grid opacity-80" />
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-semibold leading-tight">
                BankSim Console
              </p>
              <p className="text-xs text-muted">Enterprise banking simulation UI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <section>
            <p className="chip">Backend ready • Swagger driven</p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A modern interface for your Spring Boot banking backend.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted">
              Role-aware console for customers and bank operations. Uses JWT,
              idempotent transfers, statements, notifications, fraud workflows, and
              reporting APIs.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login">
                <Button>
                  Open console <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                className="inline-flex items-center gap-2 rounded-lg bg-black/5 px-4 py-3 text-sm font-semibold text-ink hover:bg-black/10"
                href="http://localhost:8080/swagger-ui/index.html"
                target="_blank"
                rel="noreferrer"
              >
                Swagger UI
              </a>
            </div>

            <div className="mt-10 surface p-6">
              <p className="text-xs font-semibold text-muted">Seed credentials</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Admin</span>
                  <span className="font-mono text-xs">admin / password</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Manager</span>
                  <span className="font-mono text-xs">manager1 / password</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Employee</span>
                  <span className="font-mono text-xs">employee1 / password</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Auditor</span>
                  <span className="font-mono text-xs">auditor1 / password</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Customer</span>
                  <span className="font-mono text-xs">customer1 / password</span>
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="surface overflow-hidden">
              <div className="bg-gradient-to-br from-primary/12 via-white to-white p-6">
                <p className="text-xs font-semibold text-muted">Preview</p>
                <p className="mt-1 font-display text-lg font-semibold">
                  Customer dashboard snapshot
                </p>
              </div>
              <img
                src={hero}
                alt="Dashboard preview"
                className="h-[420px] w-full object-cover"
                loading="lazy"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

