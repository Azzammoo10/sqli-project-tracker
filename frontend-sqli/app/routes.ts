// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/login", "routes/auth/login.tsx"),
  route("contact/admin", "routes/contact/admin.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("admin/dashboard", "routes/admin/dashboard.tsx"),
  route("admin/users", "routes/admin/users.tsx"),
  route("admin/users/create", "routes/admin/users/create.tsx"),
  route("admin/users/:id/edit", "routes/admin/users/edit.tsx"),
  // app/routes.ts
  route("admin/projects", "routes/admin/projects.tsx"),
  route("admin/history", "routes/admin/history.tsx"),
  route("admin/settings", "routes/admin/settings.tsx"),
  route("chef/dashboard", "routes/chef/dashboard.tsx"),
  route("chef/projects", "routes/chef/projects.tsx"),
  route("chef/projects/create", "routes/chef/projects/create.tsx"),
  route("chef/tasks", "routes/chef/tasks.tsx"),
  route("chef/team", "routes/chef/team.tsx"),
  route("chef/analytics", "routes/chef/analytics.tsx"),
  route("chef/settings", "routes/chef/settings.tsx"),
  route("dev/dashboard", "routes/dev/dashboard.tsx"),
  route("dev/projects", "routes/dev/projects.tsx"),
  route("client/dashboard", "routes/client/dashboard.tsx"),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
