export interface DocPage {
  title: string
  path: string
}

export interface DocSection {
  title: string
  icon: string
  path: string
  children?: DocPage[]
}

export const docsNav: DocSection[] = [
  {
    title: "Getting Started",
    icon: "🚀",
    path: "/docs/getting-started",
    children: []
  },
  {
    title: "For Users",
    icon: "👤",
    path: "/docs/users",
    children: [
      { title: "Dashboard", path: "/docs/users/dashboard" },
      { title: "Search & Discovery", path: "/docs/users/search" },
      { title: "Common Workflows", path: "/docs/users/workflows" }
    ]
  },
  {
    title: "For Admins",
    icon: "⚙️",
    path: "/docs/admin",
    children: [
      { title: "Brand Management", path: "/docs/admin/brands" },
      { title: "Settings & Configuration", path: "/docs/admin/settings" },
      { title: "Admin Tasks", path: "/docs/admin/tasks" }
    ]
  },
  {
    title: "Reference",
    icon: "📚",
    path: "/docs/reference",
    children: [
      { title: "Troubleshooting", path: "/docs/reference/troubleshooting" },
      { title: "Tips & Best Practices", path: "/docs/reference/tips" },
      { title: "Support & Resources", path: "/docs/reference/support" }
    ]
  }
]

// Helper function to get all pages in order
export function getAllPages(): { title: string; path: string }[] {
  const pages: { title: string; path: string }[] = []

  docsNav.forEach(section => {
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => {
        pages.push({ title: child.title, path: child.path })
      })
    } else {
      pages.push({ title: section.title, path: section.path })
    }
  })

  return pages
}

// Helper function to get prev/next pages
export function getPageNavigation(currentPath: string) {
  const allPages = getAllPages()
  const currentIndex = allPages.findIndex(p => p.path === currentPath)

  return {
    prev: currentIndex > 0 ? { title: allPages[currentIndex - 1].title, href: allPages[currentIndex - 1].path } : undefined,
    next: currentIndex < allPages.length - 1 ? { title: allPages[currentIndex + 1].title, href: allPages[currentIndex + 1].path } : undefined
  }
}
