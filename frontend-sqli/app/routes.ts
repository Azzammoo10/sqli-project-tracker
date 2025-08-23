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
  route("admin/projects", "routes/admin/projects.tsx"),
  route("admin/history", "routes/admin/history.tsx"),
  route("admin/contact-requests", "routes/admin/contact-requests.tsx"),

  route("admin/settings", "routes/admin/settings.tsx"),
  route("/admin/projects/:id", "routes/admin/project-details.tsx"),


  route("chef/dashboard", "routes/chef/dashboard.tsx"),
  route("/chef/tasks/:id/edit", "routes/chef/taches/task-edit.tsx"),
  route("chef/projects", "routes/chef/projects.tsx"),
  route("chef/projects/create", "routes/chef/projects/create.tsx"),
  route("chef/projects/:id", "routes/chef/projects/[id].tsx"),
  route("chef/projects/edit/:id", "routes/chef/projects/edit.tsx"),
  route("chef/tasks", "routes/chef/tasks.tsx"),
  route("chef/tasks/create","routes/chef/taches/createTask.tsx"),
  route("chef/team", "routes/chef/team.tsx"),
  route("chef/analytics", "routes/chef/analytics.tsx"),
  route("chef/settings", "routes/chef/settings.tsx"),


  route("dev/dashboard", "routes/dev/dashboard.tsx"),
  route("dev/projects", "routes/dev/projects.tsx"),
  route("dev/tasks", "routes/dev/tasks.tsx"),
  route("dev/team", "routes/dev/team.tsx"),
  route("dev/settings", "routes/dev/settings.tsx"),


  route("client/dashboard", "routes/client/dashboard.tsx"),
  route("client/projects", "routes/client/projects.tsx"),
  route("client/projects/:id", "routes/client/project-details.tsx"),
  route("client/settings", "routes/client/settings.tsx"),



  // Route publique pour les projets (accessible via QR code)
  route("project/:id", "routes/project-public.tsx"),


  route("*", "routes/404.tsx"),


] satisfies RouteConfig;
