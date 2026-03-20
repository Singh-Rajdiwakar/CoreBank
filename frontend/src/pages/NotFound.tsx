import { Link } from 'react-router-dom'

import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="surface p-8">
          <p className="chip">404</p>
          <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
          <p className="mt-2 text-sm text-muted">
            The page you are looking for does not exist.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button>Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

