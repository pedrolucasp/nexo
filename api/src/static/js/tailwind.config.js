tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "background-light": "#f6f8f6",
        "border-subtle": "#f1f5f9",
        "surface-light": "#ffffff",
        "pill-indigo": "#e0e7ff",
        "pill-purple": "#f3e8ff",
        "text-primary": "#0f172a",
        "status-active-bg": "rgba(19, 236, 91, 0.1)",
        "text-secondary": "#64748b",
        "pill-blue": "#dbeafe",
        "brand-green": "#13ec5b"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "container-padding": "1rem",
        "section-gap": "2rem",
        "card-gap": "0.75rem",
        "internal-padding": "1rem",
        "inline-gap-sm": "0.5rem"
      },
      "fontFamily": {
        "label-sm": ["Inter"],
        "body-md": ["Inter"],
        "body-lg": ["Inter"],
        "headline-md": ["Inter"],
        "headline-lg": ["Inter"]
      },
      "fontSize": {
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "body-lg": ["16px", { "lineHeight": "20px", "fontWeight": "700" }],
        "headline-md": ["18px", { "lineHeight": "24px", "fontWeight": "700" }],
        "headline-lg": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    },
  },
}
