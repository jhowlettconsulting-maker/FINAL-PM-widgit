/**
 * Placeholder for the production HubSpot form.
 *
 * On the live site, this renders an embedded HubSpot lead-capture form.
 * In the sandbox it renders a styled placeholder so you can design the
 * surrounding layout. Use it like any other component:
 *
 *   <HubSpotForm />
 *
 * SSI will swap in the live form during integration.
 */
type HubSpotFormProps = {
  variant?: "placeholder" | "inlineDark";
};

export function HubSpotForm({ variant = "placeholder" }: HubSpotFormProps) {
  if (variant === "inlineDark") {
    return (
      <form className="fs02-inline-form" aria-label="Subscribe form">
        <label>
          <span>First name</span>
          <input type="text" name="firstname" aria-label="First name" />
        </label>
        <label>
          <span>Email *</span>
          <input type="email" name="email" aria-label="Email" required />
        </label>
        <button type="submit">Subscribe</button>
      </form>
    );
  }

  return (
    <div
      className="w-full max-w-md mx-auto p-8 bg-white border-2 border-dashed border-[var(--medium-gray)] rounded-[var(--radius-lg)]"
      aria-label="HubSpot form placeholder"
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-[var(--medium-gray)] font-semibold">
            HubSpot Form Placeholder
          </p>
          <p className="text-sm text-[var(--dark-gray)] mt-1">
            SSI will replace this with the real form
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-[var(--light-gray)] rounded-[var(--radius-sm)]" />
          <div className="h-10 bg-[var(--light-gray)] rounded-[var(--radius-sm)]" />
          <div className="h-10 bg-[var(--light-gray)] rounded-[var(--radius-sm)]" />
          <div className="h-24 bg-[var(--light-gray)] rounded-[var(--radius-sm)]" />
          <div className="h-11 bg-[var(--deep-purple)] rounded-[var(--radius-md)] flex items-center justify-center text-white text-sm font-medium">
            Submit
          </div>
        </div>
      </div>
    </div>
  );
}
